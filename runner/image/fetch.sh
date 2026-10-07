#!/bin/sh
# Download a file over HTTPS and verify its checksum before anyone touches it.
#
#   fetch.sh <url> <sha256|sha512-base64> <dest>
#
# The hash is mandatory: an empty or mismatching hash aborts the image build.
# A sha512 (npm "integrity" style) is accepted as `sha512-<base64>`; anything
# else is treated as a hex SHA-256.
#
# Optional build-time inputs (never baked into the image):
#   * secret "cabundle"  -> extra CA bundle, for builds behind a TLS-inspecting proxy
#   * HTTPS_PROXY        -> standard proxy variable (BuildKit predefined build arg)
set -eu

url="$1"
want="$2"
dest="$3"

if [ -z "$want" ]; then
  echo "fetch.sh: refusing to download $url without a checksum" >&2
  exit 2
fi

cacert=""
if [ -s /run/secrets/cabundle ]; then
  cacert="--cacert /run/secrets/cabundle"
fi

# shellcheck disable=SC2086
curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 \
  --retry 5 --retry-delay 3 --retry-connrefused $cacert --output "$dest" "$url"

case "$want" in
  sha512-*)
    got="sha512-$(openssl dgst -sha512 -binary "$dest" | openssl base64 -A)"
    ;;
  *)
    got="$(sha256sum "$dest" | cut -d' ' -f1)"
    ;;
esac

if [ "$got" != "$want" ]; then
  echo "fetch.sh: checksum mismatch for $url" >&2
  echo "  expected: $want" >&2
  echo "  actual:   $got" >&2
  rm -f "$dest"
  exit 3
fi
