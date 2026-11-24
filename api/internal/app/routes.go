package app

import (
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/domains/backup"
	"pocketrun-api/internal/domains/group"
	"pocketrun-api/internal/domains/health"
	"pocketrun-api/internal/domains/kv"
	"pocketrun-api/internal/domains/link"
	"pocketrun-api/internal/domains/overview"
	"pocketrun-api/internal/domains/page"
	"pocketrun-api/internal/domains/user"
	"pocketrun-api/internal/domains/user/middlewares/managerauth"
	"pocketrun-api/internal/services/httpx"
)

const adminPrefix = "/admin"

func newRouter(cfg config.Config, s services, validate *validator.Validate, logger *slog.Logger) http.Handler {
	router := httpx.Router{
		Admin:        http.NewServeMux(),
		Public:       http.NewServeMux(),
		Authenticate: managerauth.Authenticate(s.signer, s.users, logger),
		Validate:     validate,
		Logger:       logger,
	}

	health.Register(router)
	user.Register(router, user.Services{Users: s.users, Setup: s.setup})
	kv.Register(router, kv.Services{Applications: s.applications, Documents: s.documents})
	group.Register(router, group.Services{Groups: s.groups, Links: s.links, Pages: s.pages})
	pageServer := page.Register(router, page.Services{
		Pages:     s.pages,
		Versions:  s.versions,
		History:   s.pageHistory,
		Analytics: s.pageAnalytics,
		Access:    s.access,
		Bindings:  s.bindings,
	}, cfg.LinksURL)
	link.Register(router, link.Services{Links: s.links, History: s.linkHistory, Analytics: s.linkAnalytics}, cfg.LinksURL, pageServer)
	overview.Register(router, s.overview)
	backup.Register(router, s.backup)

	root := http.NewServeMux()
	root.Handle(adminPrefix+"/", http.StripPrefix(adminPrefix, httpx.CORS(cfg.AdminCORSAllowedOrigins, true)(router.Admin)))
	root.Handle("/", httpx.CORS(cfg.CORSAllowedOrigins, false)(router.Public))
	return root
}
