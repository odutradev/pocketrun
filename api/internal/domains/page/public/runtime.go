package public

import (
	"encoding/json"
	"fmt"
	"regexp"
	"time"

	"pocketrun-api/internal/domains/page/binding"
	"pocketrun-api/internal/domains/page/page"
)

const runtimeAPIVersion = 1

const kvClientScript = `function createKV(cfg){var reserved={page:1,limit:1,pagination:1,sortBy:1,sortOrder:1,createdAfter:1,createdBefore:1};var rules=(cfg.rules||[]).map(function(rule){return Object.freeze({collection:rule.collection,operations:Object.freeze(rule.operations.slice())})});var base="/"+encodeURIComponent(page.slug)+"/_/kv/";function ruleFor(name){var wildcard=null;for(var i=0;i<rules.length;i++){if(rules[i].collection===name)return rules[i];if(rules[i].collection==="*")wildcard=rules[i]}return wildcard}function can(name,operation){var rule=ruleFor(name);return Boolean(rule)&&rule.operations.indexOf(operation)>=0}function encode(query){var parts=[];if(query)Object.keys(query).forEach(function(key){var value=query[key];if(value===undefined)return;var text=reserved[key]||typeof value!=="string"?String(value):'"'+value+'"';parts.push(encodeURIComponent(key)+"="+encodeURIComponent(text))});return parts.length?"?"+parts.join("&"):""}function fail(status,body){var error=new Error(body&&body.error||"request_failed");error.name="PocketrunKVError";error.status=status;error.code=body&&body.error||"request_failed";error.fields=body&&body.fields||null;return error}function send(method,path,body){var headers={"X-Pocketrun-Page":"1"};if(body!==undefined)headers["Content-Type"]="application/json";return fetch(base+path,{method:method,headers:headers,credentials:"same-origin",cache:"no-store",body:body===undefined?undefined:JSON.stringify(body)}).then(function(response){return response.text().then(function(text){var data=null;try{data=text?JSON.parse(text):null}catch(ignored){data=null}if(!response.ok)throw fail(response.status,data);return data})})}function options(extra,data){var body={data:data};if(extra&&extra.expiresInDays!==undefined)body.expiresInDays=extra.expiresInDays;if(extra&&extra.expiresAt!==undefined)body.expiresAt=extra.expiresAt;return body}function collection(name){var path=encodeURIComponent(name);return Object.freeze({name:name,list:function(query){return send("GET",path+"/get-all"+encode(query))},get:function(id){return send("GET",path+"/get/"+encodeURIComponent(id))},count:function(filters){return send("GET",path+"/count"+encode(filters))},eval:function(operation,field,filters){return send("POST",path+"/eval",{operation:operation,field:field||"",filters:filters||{}})},create:function(data,extra){return send("POST",path+"/create",options(extra,data))},update:function(id,data,extra){return send("PATCH",path+"/update/"+encodeURIComponent(id),options(extra,data))},replace:function(id,data,extra){return send("PUT",path+"/replace/"+encodeURIComponent(id),options(extra,data))},remove:function(id){return send("DELETE",path+"/delete/"+encodeURIComponent(id))},can:function(operation){return can(name,operation)}})}return Object.freeze({role:cfg.role,isOwnDocumentsOnly:Boolean(cfg.isOwnDocumentsOnly),rules:Object.freeze(rules),collection:collection,can:can})}`

const runtimeScript = `(function(info,extra){if("pocketrun" in window)return;var page=Object.freeze(info);%s;var runtime={apiVersion:%d,page:page,access:Object.freeze({isProtected:extra.access.isProtected,role:extra.access.role})};if(extra.kv)runtime.kv=createKV(extra.kv);Object.defineProperty(window,"pocketrun",{value:Object.freeze(runtime),enumerable:false});var date=new Date(page.updatedAt).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});console.log("%%cPocketRun%%c "+page.slug+" · v"+page.version+(page.isPreview?" · prévia do editor":" · atualizada em "+date),"background:#ffc93c;color:#111;font-weight:700;padding:1px 6px;border-radius:4px","color:inherit")})(%s,%s);`

var (
	headPattern    = regexp.MustCompile(`(?i)<head(\s[^>]*)?>`)
	htmlPattern    = regexp.MustCompile(`(?i)<html(\s[^>]*)?>`)
	doctypePattern = regexp.MustCompile(`(?i)<!doctype[^>]*>`)
)

type runtimePage struct {
	Slug      string `json:"slug"`
	Title     string `json:"title"`
	Version   int    `json:"version"`
	UpdatedAt string `json:"updatedAt"`
	IsPreview bool   `json:"isPreview"`
}

type runtimeAccess struct {
	IsProtected bool    `json:"isProtected"`
	Role        *string `json:"role"`
}

type runtimeExtra struct {
	Access runtimeAccess    `json:"access"`
	KV     *binding.Runtime `json:"kv"`
}

func runtimeTag(target page.Page, extra runtimeExtra) (string, error) {
	info, err := json.Marshal(runtimePage{
		Slug:      target.Slug,
		Title:     target.Title,
		Version:   target.Version,
		UpdatedAt: target.UpdatedAt.UTC().Format(time.RFC3339),
	})
	if err != nil {
		return "", fmt.Errorf("encode page runtime: %w", err)
	}
	extraJSON, err := json.Marshal(extra)
	if err != nil {
		return "", fmt.Errorf("encode page runtime extra: %w", err)
	}
	return "<script>" + fmt.Sprintf(runtimeScript, kvClientScript, runtimeAPIVersion, info, extraJSON) + "</script>", nil
}

func injectRuntime(document, tag string) string {
	for _, pattern := range []*regexp.Regexp{headPattern, htmlPattern, doctypePattern} {
		if location := pattern.FindStringIndex(document); location != nil {
			return document[:location[1]] + "\n" + tag + document[location[1]:]
		}
	}
	return tag + "\n" + document
}
