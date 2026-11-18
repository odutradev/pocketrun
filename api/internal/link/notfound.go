package link

import "net/http"

const notFoundPage = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Link indisponível · PocketRun</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
html,body{height:100%;margin:0}
body{display:flex;align-items:center;justify-content:center;padding:16px;background:#111111;color:#EEEEEE;font-family:'Hanken Grotesk',sans-serif;-webkit-font-smoothing:antialiased}
main{display:flex;flex-direction:column;align-items:center;gap:12px;max-width:420px;padding:48px 16px;text-align:center}
svg{display:block}
h1{margin:4px 0 0;font-size:17px;font-weight:700;color:#EEEEEE}
p{margin:0;font-size:15px;line-height:1.5;color:#B4B4B4}
</style>
</head>
<body>
<main>
<svg width="68" height="21" viewBox="10 58 78 24" aria-hidden="true"><defs><mask id="rivet"><rect x="0" y="0" width="96" height="96" fill="#fff"/><circle cx="24" cy="70" r="4.5" fill="#000"/></mask></defs><rect x="12" y="60" width="74" height="20" rx="10" fill="#EEEEEE" mask="url(#rivet)"/></svg>
<h1>Link indisponível</h1>
<p>Este endereço não existe, foi desativado ou já expirou. Confira o link com quem o enviou.</p>
</main>
</body>
</html>
`

func (h *Handler) writeNotFoundPage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com")
	w.WriteHeader(http.StatusNotFound)
	if _, err := w.Write([]byte(notFoundPage)); err != nil {
		h.logger.WarnContext(r.Context(), "write not found page", "error", err)
	}
}
