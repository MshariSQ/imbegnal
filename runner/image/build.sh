#!/bin/sh
# Build the toolchain image.
#
#   runner/image/build.sh [slim|full]            # tag imbegnal-runner:<profile>
#
# Environment (all optional):
#   RUNNER_IMAGE_TAG    full tag to use instead of imbegnal-runner:<profile>
#   BASE_IMAGE          base image (default mirror.gcr.io/library/ubuntu:24.04)
#   WITH_KOTLIN=0|1     include Kotlin (full only, default 1)
#   WITH_SWIFT=0|1      include Swift (full only, default 1; needs SWIFT_SHA256)
#   SWIFT_VERSION, SWIFT_SHA256, SWIFT_PLATFORM    see the Dockerfile header
#   BUILD_CA_BUNDLE     CA bundle for TLS-inspecting proxies (mounted for downloads only)
#   BUILD_NETWORK       docker build --network value (default "host")
#
# HTTPS_PROXY/https_proxy from the environment is forwarded to the downloads.
set -eu

profile="${1:-full}"
case "$profile" in slim | full) ;; *) echo "usage: $0 [slim|full]" >&2; exit 2 ;; esac

here="$(cd "$(dirname "$0")/.." && pwd)"
tag="${RUNNER_IMAGE_TAG:-imbegnal-runner:$profile}"

set -- build --network "${BUILD_NETWORK:-host}" \
  -f "$here/Dockerfile" \
  --build-arg "PROFILE=$profile" \
  --label imbegnal.runner=1 \
  -t "$tag"

[ -n "${BASE_IMAGE:-}" ] && set -- "$@" --build-arg "BASE_IMAGE=$BASE_IMAGE"
[ -n "${WITH_KOTLIN:-}" ] && set -- "$@" --build-arg "WITH_KOTLIN=$WITH_KOTLIN"
[ -n "${WITH_SWIFT:-}" ] && set -- "$@" --build-arg "WITH_SWIFT=$WITH_SWIFT"
[ -n "${SWIFT_VERSION:-}" ] && set -- "$@" --build-arg "SWIFT_VERSION=$SWIFT_VERSION"
[ -n "${SWIFT_SHA256:-}" ] && set -- "$@" --build-arg "SWIFT_SHA256=$SWIFT_SHA256"
[ -n "${SWIFT_PLATFORM:-}" ] && set -- "$@" --build-arg "SWIFT_PLATFORM=$SWIFT_PLATFORM"
proxy="${HTTPS_PROXY:-${https_proxy:-}}"
[ -n "$proxy" ] && set -- "$@" --build-arg "HTTPS_PROXY=$proxy"
[ -n "${BUILD_CA_BUNDLE:-}" ] && set -- "$@" --secret "id=cabundle,src=$BUILD_CA_BUNDLE"

exec docker "$@" "$here"
