#!/usr/bin/env bash
# Install the IMBEGNAL runner on a fresh Ubuntu 24.04 VM (run as root, from a checkout of the repo).
#
#   sudo runner/deploy/install.sh [--profile slim|full] [--no-image-build]
#
# What it does (idempotent: safe to re-run for upgrades; an existing /etc/imbegnal-runner.env and
# its secret are never overwritten):
#   1. installs Docker (Ubuntu's docker.io package) and the tools it needs;
#   2. installs Node.js 22 from nodejs.org, verified against a pinned SHA-256, into /opt/node;
#   3. creates the unprivileged system user `imbegnal-runner` (member of the docker group);
#   4. compiles the runner (TypeScript -> /opt/imbegnal-runner/dist);
#   5. builds the toolchain image imbegnal-runner:<profile> (slow the first time) unless --no-image-build;
#   6. writes /etc/imbegnal-runner.env with a generated RUNNER_SECRET;
#   7. installs and starts the systemd unit and waits for /healthz.
#
# Swift: the `full` image needs a checksum from swift.org. Export SWIFT_SHA256 (and optionally
# SWIFT_VERSION) before running to include it; otherwise Swift is skipped and reported unavailable.
#
# Docker access is root-equivalent: use a dedicated VM. See runner/README.md for the threat model,
# rootless Docker and gVisor.
set -euo pipefail

NODE_VERSION="22.23.3"
NODE_SHA256_AMD64="df450af89261115ef9f9e3830c3eeb2cc9213b63c720b1af623cb5dcbe2e02de"
NODE_SHA256_ARM64="a44aeb94849a299b22df10b9e622ec2f605c2183501bc40590705131de7c740f"
TYPESCRIPT_VERSION="5.9.3"

PROFILE="full"
BUILD_IMAGE=1
INSTALL_DIR="/opt/imbegnal-runner"
NODE_DIR="/opt/node"
ENV_FILE="/etc/imbegnal-runner.env"
SERVICE_USER="imbegnal-runner"

while [ $# -gt 0 ]; do
  case "$1" in
    --profile) PROFILE="${2:?--profile needs slim or full}"; shift 2 ;;
    --no-image-build) BUILD_IMAGE=0; shift ;;
    -h | --help) sed -n '2,22p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done
case "$PROFILE" in slim | full) ;; *) echo "--profile must be slim or full" >&2; exit 2 ;; esac

log() { printf '\n==> %s\n' "$*"; }
die() { echo "install.sh: $*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "run as root (sudo)"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
[ -f "$SRC/runner/src/main.ts" ] || die "run this script from a checkout of the repository"

if [ -r /etc/os-release ]; then
  . /etc/os-release
  if [ "${ID:-}" != "ubuntu" ] || [ "${VERSION_ID:-}" != "24.04" ]; then
    echo "warning: tested on Ubuntu 24.04 only (found ${PRETTY_NAME:-unknown}); continuing" >&2
  fi
fi

case "$(uname -m)" in
  x86_64) NODE_ARCH="x64"; NODE_SHA256="$NODE_SHA256_AMD64" ;;
  aarch64) NODE_ARCH="arm64"; NODE_SHA256="$NODE_SHA256_ARM64" ;;
  *) die "unsupported CPU architecture $(uname -m)" ;;
esac

log "Installing Docker and prerequisites"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y --no-install-recommends ca-certificates curl openssl xz-utils docker.io
systemctl enable --now docker

log "Installing Node.js ${NODE_VERSION} into ${NODE_DIR}"
if [ ! -x "$NODE_DIR/bin/node" ] || [ "$("$NODE_DIR/bin/node" --version)" != "v${NODE_VERSION}" ]; then
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  url="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"
  curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 --retry 5 -o "$tmp/node.tar.xz" "$url"
  echo "${NODE_SHA256}  $tmp/node.tar.xz" | sha256sum --check --status || die "Node.js checksum mismatch"
  rm -rf "$NODE_DIR"
  mkdir -p "$NODE_DIR"
  tar -xJf "$tmp/node.tar.xz" -C "$NODE_DIR" --strip-components=1
fi
export PATH="$NODE_DIR/bin:$PATH"

log "Creating the service user"
if ! id "$SERVICE_USER" >/dev/null 2>&1; then
  useradd --system --home-dir /var/lib/imbegnal-runner --shell /usr/sbin/nologin "$SERVICE_USER"
fi
usermod -aG docker "$SERVICE_USER"

log "Compiling the runner"
build="$(mktemp -d)"
npm install --prefix "$build" --no-audit --no-fund --ignore-scripts "typescript@${TYPESCRIPT_VERSION}" "@types/node@22" >/dev/null
rm -rf "$INSTALL_DIR/dist"
mkdir -p "$INSTALL_DIR"
"$build/node_modules/.bin/tsc" -p "$SRC/runner" --typeRoots "$build/node_modules/@types" --outDir "$INSTALL_DIR/dist"
rm -rf "$build"
install -m 0644 "$SRC/runner/README.md" "$INSTALL_DIR/README.md"
chown -R root:root "$INSTALL_DIR"
chmod -R go-w "$INSTALL_DIR"

if [ "$BUILD_IMAGE" -eq 1 ]; then
  log "Building the toolchain image imbegnal-runner:${PROFILE} (this takes a while)"
  if [ "$PROFILE" = "full" ] && [ -z "${SWIFT_SHA256:-}" ]; then
    echo "note: SWIFT_SHA256 is not set, building without Swift (it will be reported unavailable)" >&2
    export WITH_SWIFT=0
  fi
  "$SRC/runner/image/build.sh" "$PROFILE"
else
  docker image inspect "imbegnal-runner:${PROFILE}" >/dev/null 2>&1 || echo "warning: image imbegnal-runner:${PROFILE} does not exist yet" >&2
fi

log "Writing ${ENV_FILE}"
if [ -f "$ENV_FILE" ]; then
  echo "${ENV_FILE} exists: keeping it (and its secret)"
else
  secret="$(openssl rand -hex 32)"
  umask 0077
  sed -e "s|^RUNNER_SECRET=.*|RUNNER_SECRET=${secret}|" \
      -e "s|^RUNNER_IMAGE=.*|RUNNER_IMAGE=imbegnal-runner:${PROFILE}|" \
      "$SRC/runner/deploy/.env.example" > "$ENV_FILE"
  chown "root:${SERVICE_USER}" "$ENV_FILE"
  chmod 0640 "$ENV_FILE"
fi

log "Installing the systemd unit"
install -m 0644 "$SRC/runner/deploy/imbegnal-runner.service" /etc/systemd/system/imbegnal-runner.service
systemctl daemon-reload
systemctl enable imbegnal-runner.service
systemctl restart imbegnal-runner.service

log "Waiting for the runner to answer"
port="$(sed -n 's/^RUNNER_PORT=//p' "$ENV_FILE" | head -n1)"
for _ in $(seq 1 60); do
  if curl --silent --fail "http://127.0.0.1:${port:-4242}/healthz" >/dev/null; then
    cat <<DONE

The runner is up on 127.0.0.1:${port:-4242}.

Next steps
  * Read the secret once:   sudo sed -n 's/^RUNNER_SECRET=//p' ${ENV_FILE}
    and give it to the Worker:  wrangler secret put RUNNER_SECRET
  * Expose the runner over HTTPS (Cloudflare Tunnel / Caddy) and set RUNNER_URL in the Worker,
    see runner/README.md.
  * Logs:  journalctl -u imbegnal-runner -f      Languages available:  see the start-up log line
DONE
    exit 0
  fi
  sleep 1
done
journalctl -u imbegnal-runner --no-pager -n 30 >&2 || true
die "the runner did not become healthy within 60 s"
