# Sourced (`. scripts/cf-env.sh`) by .github/workflows/deploy.yml before every step that talks to
# Cloudflare. A secret pasted into GitHub with a trailing newline or space keeps it: wrangler 4 then
# refuses the account ID ("Account IDs may only contain alphanumeric characters, hyphens, and
# underscores"), and the token would be sent with it. Neither value can contain whitespace, so all of
# it is removed. Values are never printed.
CLOUDFLARE_ACCOUNT_ID="$(printf '%s' "${CLOUDFLARE_ACCOUNT_ID-}" | tr -d '[:space:]')"
CLOUDFLARE_API_TOKEN="$(printf '%s' "${CLOUDFLARE_API_TOKEN-}" | tr -d '[:space:]')"
export CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN
