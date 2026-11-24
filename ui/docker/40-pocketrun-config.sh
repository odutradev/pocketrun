#!/bin/sh
set -eu

fail() {
  echo "pocketrun: $1" >&2
  exit 1
}

check_url() {
  case "$2" in
    "") fail "$1 is required" ;;
    *[!A-Za-z0-9:/._~%@+=-]*) fail "$1 has characters that are not allowed in a URL" ;;
    http://?* | https://?*) ;;
    *) fail "$1 must be an http or https URL" ;;
  esac
}

API_URL="${API_URL:-}"
LINKS_URL="${LINKS_URL:-}"

check_url API_URL "$API_URL"
check_url LINKS_URL "$LINKS_URL"

printf 'window.__POCKETRUN_CONFIG__ = { apiUrl: "%s", linksUrl: "%s" };\n' "$API_URL" "$LINKS_URL" \
  > /usr/share/nginx/html/config.js
