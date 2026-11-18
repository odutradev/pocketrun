package public

import (
	"html"
	"net/http"
	"strings"
)

const (
	gateHeading     = "Página protegida"
	gateMessage     = "Digite o PIN de 6 números que você recebeu para abrir esta página."
	gateWrongPIN    = "PIN incorreto. Confira os números e tente de novo."
	gateInvalidPIN  = "Digite os 6 números do PIN."
	gateTooMany     = "Muitas tentativas erradas. Espere alguns minutos e tente de novo."
	gateSecurityCSP = "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
)

const gatePage = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{{heading}} · PocketRun</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
html,body{height:100%;margin:0}
body{display:flex;align-items:center;justify-content:center;padding:16px;background:#111111;color:#EEEEEE;font-family:'Hanken Grotesk',sans-serif;-webkit-font-smoothing:antialiased}
main{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;max-width:360px;padding:48px 0;text-align:center}
svg{display:block}
h1{margin:4px 0 0;font-size:17px;font-weight:700}
p{margin:0;font-size:15px;line-height:1.5;color:#B4B4B4}
form{display:flex;flex-direction:column;gap:12px;width:100%;margin-top:12px}
input{width:100%;height:52px;padding:0 16px;border:1px solid #3A3A3A;border-radius:10px;background:#1A1A1A;color:#EEEEEE;font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:.5em;text-align:center;text-indent:.5em}
input:focus{outline:2px solid #EEEEEE;outline-offset:2px;border-color:transparent}
button{height:44px;border:0;border-radius:10px;background:#EEEEEE;color:#111111;font:inherit;font-size:15px;font-weight:700;cursor:pointer}
button:focus-visible{outline:2px solid #EEEEEE;outline-offset:2px}
.error{color:#FF8A80}
.hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
</style>
</head>
<body>
<main>
<svg width="68" height="21" viewBox="10 58 78 24" aria-hidden="true"><defs><mask id="rivet"><rect x="0" y="0" width="96" height="96" fill="#fff"/><circle cx="24" cy="70" r="4.5" fill="#000"/></mask></defs><rect x="12" y="60" width="74" height="20" rx="10" fill="#EEEEEE" mask="url(#rivet)"/></svg>
<h1>{{heading}}</h1>
<p>{{message}}</p>
<form method="post" autocomplete="off">
<label for="pin" class="hidden">PIN</label>
<input id="pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="one-time-code" required autofocus{{describedBy}}>
{{error}}
<button type="submit">Abrir página</button>
</form>
</main>
</body>
</html>
`

func writeGate(w http.ResponseWriter, r *http.Request, status int, problem string) error {
	errorBlock, describedBy := "", ""
	if problem != "" {
		errorBlock = `<p id="pin-error" class="error" role="alert">` + html.EscapeString(problem) + `</p>`
		describedBy = ` aria-describedby="pin-error" aria-invalid="true"`
	}

	body := strings.NewReplacer(
		"{{heading}}", html.EscapeString(gateHeading),
		"{{message}}", html.EscapeString(gateMessage),
		"{{error}}", errorBlock,
		"{{describedBy}}", describedBy,
	).Replace(gatePage)

	setPrivateHeaders(w)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Content-Security-Policy", gateSecurityCSP)
	w.Header().Set("X-Frame-Options", "DENY")
	w.WriteHeader(status)
	if r.Method == http.MethodHead {
		return nil
	}
	_, err := w.Write([]byte(body))
	return err
}

func setPrivateHeaders(w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "private, no-store")
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Referrer-Policy", "no-referrer")
}
