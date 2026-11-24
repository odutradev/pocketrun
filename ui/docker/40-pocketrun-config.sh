#!/bin/sh
set -eu

escape() {
  printf '%s' "$1" | tr -d '\r\n' | sed -e 's/[\\"]/\\&/g'
}

printf 'window.__POCKETRUN_CONFIG__ = { apiUrl: "%s", linksUrl: "%s" };\n' \
  "$(escape "${API_URL:-}")" \
  "$(escape "${LINKS_URL:-}")" \
  > /usr/share/nginx/html/config.js
