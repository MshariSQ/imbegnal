# syntax=docker/dockerfile:1
#
# IMBEGNAL runner toolchain image: everything user code is compiled and run with.
# It contains NO runner service code, NO secrets and NO network-capable package
# manager; containers started from it run with --network none, a read-only rootfs
# and a tmpfs /work (see runner/src/docker.ts).
#
#   docker build --network host -f runner/Dockerfile --build-arg PROFILE=slim -t imbegnal-runner:slim runner/
#   docker build --network host -f runner/Dockerfile --build-arg PROFILE=full -t imbegnal-runner:full runner/
#
# PROFILE=slim  python3, Node.js + TypeScript, OpenJDK, gcc/g++        (CI, E2E, small VMs)
# PROFILE=full  slim + Go, Rust, Ruby, PHP, C# (Mono), Kotlin, Swift   (production)
#
# Build-time switches for `full` (all default to 1):
#   WITH_KOTLIN=0   skip the Kotlin compiler download
#   WITH_SWIFT=0    skip Swift (REQUIRED when you cannot supply SWIFT_SHA256, see below)
#
# Behind a TLS-inspecting egress proxy add:
#   --secret id=cabundle,src=/path/to/ca-bundle.crt  --build-arg HTTPS_PROXY=http://host:port
# The CA bundle is only mounted for the download step; it is never copied into the image.
#
# Every downloaded archive is verified against a pinned checksum (runner/image/fetch.sh).

ARG BASE_IMAGE=mirror.gcr.io/library/ubuntu:24.04

# ---------------------------------------------------------------------------
# Stage 1: download and verify the toolchains that are not (or not recent
# enough) in the distro. Nothing from this stage except /out reaches the image.
# ---------------------------------------------------------------------------
FROM ${BASE_IMAGE} AS fetch
ARG PROFILE=full
ARG TARGETARCH
ARG WITH_KOTLIN=1
ARG WITH_SWIFT=1

ARG NODE_VERSION=22.23.3
ARG NODE_SHA256_AMD64=df450af89261115ef9f9e3830c3eeb2cc9213b63c720b1af623cb5dcbe2e02de
ARG NODE_SHA256_ARM64=a44aeb94849a299b22df10b9e622ec2f605c2183501bc40590705131de7c740f

# TypeScript 5.x is the pure-JavaScript compiler (7.x ships native binaries).
ARG TYPESCRIPT_VERSION=5.9.3
ARG TYPESCRIPT_INTEGRITY=sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==
ARG TYPES_NODE_VERSION=22.20.5
ARG TYPES_NODE_INTEGRITY=sha512-U2+DNr+wSjpsTS/wZGYHq7GcwfuSmKiKvoPvK22zwTlRhU91yOniN4qRR5KhIjvif7ysw/dz/hKmfDH0Ris4aA==
ARG UNDICI_TYPES_VERSION=6.21.0
ARG UNDICI_TYPES_INTEGRITY=sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==

ARG KOTLIN_VERSION=2.2.21
ARG KOTLIN_SHA256=a623871f1cd9c938946948b70ef9170879f0758043885bbd30c32f024e511714

# Swift is published by swift.org only. Look the checksum up on
# https://www.swift.org/install/linux/ for your version/OS/arch (Ubuntu 24.04) and pass it
# in. There is deliberately no default: an unverified toolchain is never installed.
ARG SWIFT_VERSION=6.1.2
ARG SWIFT_PLATFORM=ubuntu2404
ARG SWIFT_SHA256=

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl openssl xz-utils unzip \
 && rm -rf /var/lib/apt/lists/*

COPY image/fetch.sh /usr/local/bin/fetch.sh
RUN chmod 0755 /usr/local/bin/fetch.sh && mkdir -p /out /tmp/dl

# Node.js: only the binary is needed (no npm: there is no network at run time).
RUN --mount=type=secret,id=cabundle,required=false \
    set -eu; \
    case "${TARGETARCH:-amd64}" in \
      amd64) arch=x64;   sum="$NODE_SHA256_AMD64" ;; \
      arm64) arch=arm64; sum="$NODE_SHA256_ARM64" ;; \
      *) echo "unsupported architecture: ${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    fetch.sh "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${arch}.tar.xz" "$sum" /tmp/dl/node.tar.xz; \
    mkdir -p /out/node/bin; \
    tar -xJf /tmp/dl/node.tar.xz -C /tmp/dl --strip-components=1 "node-v${NODE_VERSION}-linux-${arch}/bin/node" "node-v${NODE_VERSION}-linux-${arch}/LICENSE"; \
    mv /tmp/dl/bin/node /out/node/bin/node; mv /tmp/dl/LICENSE /out/node/LICENSE; \
    rm -rf /tmp/dl/*

# TypeScript compiler + Node typings, laid out as a node_modules tree so that
# `tsc --types node` resolves `undici-types` without any package manager.
RUN --mount=type=secret,id=cabundle,required=false \
    set -eu; \
    base=/out/ts/node_modules; \
    mkdir -p "$base/typescript" "$base/@types/node" "$base/undici-types"; \
    fetch.sh "https://registry.npmjs.org/typescript/-/typescript-${TYPESCRIPT_VERSION}.tgz" "$TYPESCRIPT_INTEGRITY" /tmp/dl/ts.tgz; \
    tar -xzf /tmp/dl/ts.tgz -C "$base/typescript" --strip-components=1; \
    fetch.sh "https://registry.npmjs.org/@types/node/-/node-${TYPES_NODE_VERSION}.tgz" "$TYPES_NODE_INTEGRITY" /tmp/dl/tn.tgz; \
    tar -xzf /tmp/dl/tn.tgz -C "$base/@types/node" --strip-components=1; \
    fetch.sh "https://registry.npmjs.org/undici-types/-/undici-types-${UNDICI_TYPES_VERSION}.tgz" "$UNDICI_TYPES_INTEGRITY" /tmp/dl/ut.tgz; \
    tar -xzf /tmp/dl/ut.tgz -C "$base/undici-types" --strip-components=1; \
    rm -rf /tmp/dl/*

# Kotlin compiler (full profile)
RUN --mount=type=secret,id=cabundle,required=false \
    set -eu; \
    if [ "$PROFILE" = "full" ] && [ "$WITH_KOTLIN" = "1" ]; then \
      fetch.sh "https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-compiler-${KOTLIN_VERSION}.zip" "$KOTLIN_SHA256" /tmp/dl/kotlin.zip; \
      unzip -q /tmp/dl/kotlin.zip -d /tmp/dl; \
      mv /tmp/dl/kotlinc /out/kotlinc; \
      rm -rf /out/kotlinc/bin/*.bat /tmp/dl/*; \
    else \
      mkdir -p /out/kotlinc; \
    fi

# Swift toolchain (full profile). Untested on the development VM (download.swift.org is
# unreachable there); written against swift.org's documented tarball layout.
RUN --mount=type=secret,id=cabundle,required=false \
    set -eu; \
    if [ "$PROFILE" = "full" ] && [ "$WITH_SWIFT" = "1" ]; then \
      if [ -z "$SWIFT_SHA256" ]; then \
        echo "Swift requested but SWIFT_SHA256 is empty. Pass --build-arg SWIFT_SHA256=<sha256 of the tarball from swift.org> or --build-arg WITH_SWIFT=0." >&2; \
        exit 1; \
      fi; \
      case "${TARGETARCH:-amd64}" in amd64) suffix="" ;; arm64) suffix="-aarch64" ;; *) echo "unsupported architecture" >&2; exit 1 ;; esac; \
      file="swift-${SWIFT_VERSION}-RELEASE-${SWIFT_PLATFORM}${suffix}"; \
      fetch.sh "https://download.swift.org/swift-${SWIFT_VERSION}-release/${SWIFT_PLATFORM}${suffix}/swift-${SWIFT_VERSION}-RELEASE/${file}.tar.gz" "$SWIFT_SHA256" /tmp/dl/swift.tgz; \
      mkdir -p /out/swift; \
      tar -xzf /tmp/dl/swift.tgz -C /out/swift --strip-components=1; \
      rm -rf /tmp/dl/*; \
    else \
      mkdir -p /out/swift; \
    fi

# ---------------------------------------------------------------------------
# Stage 2: the toolchain image itself.
# ---------------------------------------------------------------------------
FROM ${BASE_IMAGE}
ARG PROFILE=full
ARG WITH_KOTLIN=1
ARG WITH_SWIFT=1
LABEL imbegnal.runner.image="1" \
      imbegnal.runner.profile="${PROFILE}"

ENV DEBIAN_FRONTEND=noninteractive

# Languages every profile ships. --no-install-recommends keeps the image small and avoids
# pulling in package managers / network helpers we do not need.
RUN set -eux; \
    apt-get update; \
    pkgs="python3 gcc g++ libc6-dev openjdk-21-jdk-headless"; \
    if [ "$PROFILE" = "full" ]; then \
      pkgs="$pkgs golang-go rustc ruby php-cli mono-mcs mono-runtime"; \
      if [ "$WITH_SWIFT" = "1" ]; then \
        pkgs="$pkgs binutils libcurl4t64 libedit2 libgcc-13-dev libpython3.12 libsqlite3-0 libstdc++-13-dev libxml2 libncurses6 tzdata zlib1g-dev"; \
      fi; \
    fi; \
    apt-get install -y --no-install-recommends $pkgs; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/* /var/log/apt/* /var/log/dpkg.log /var/log/alternatives.log /tmp/* /var/tmp/*

COPY --from=fetch /out/node/bin/node /usr/local/bin/node
COPY --from=fetch /out/node/LICENSE /usr/share/doc/node-LICENSE
COPY --from=fetch /out/ts /opt/ts
COPY --from=fetch /out/kotlinc /opt/kotlinc
COPY --from=fetch /out/swift /opt/swift
COPY image/ruby-sync.rb /opt/runner/ruby-sync.rb
COPY image/gowarm.go /tmp/gowarm/main.go

# Go: pre-build the standard library into a cache the runner seeds each job with (the Go toolchain
# has no precompiled std; building it per run would take ~25 s). The environment must match the
# one in runner/src/languages.ts or the cache is not hit. Skipped when Go is not installed.
RUN set -eux; \
    if command -v go >/dev/null 2>&1; then \
      cd /tmp/gowarm; \
      GOCACHE=/opt/gocache GOPATH=/tmp/gowarm/gopath GOENV=off CGO_ENABLED=0 GOFLAGS=-mod=mod GOPROXY=off GOSUMDB=off GOTOOLCHAIN=local \
        go build -o /dev/null main.go; \
      chmod -R a+rX /opt/gocache; \
    fi; \
    rm -rf /tmp/gowarm

RUN set -eux; \
    ln -s /opt/ts/node_modules/typescript/bin/tsc /usr/local/bin/tsc; \
    if [ ! -x /opt/kotlinc/bin/kotlinc ]; then rm -rf /opt/kotlinc; fi; \
    if [ ! -x /opt/swift/usr/bin/swiftc ]; then rm -rf /opt/swift; fi; \
    # No setuid/setgid binaries: --no-new-privileges already blocks them, this is the second lock.
    find / -xdev -perm /6000 -type f -exec chmod a-s {} + ; \
    # Work dirs exist as mount points; at run time /work is a size-capped tmpfs.
    mkdir -p /work; chown 65534:65534 /work; chmod 1777 /work

# Static settings only. The runner passes HOME/TMPDIR/PATH and language caches per container
# (see runner/src/docker.ts), so nothing here depends on the host.
ENV LANG=C.UTF-8 \
    GOPROXY=off \
    GOFLAGS=-mod=mod \
    GOTOOLCHAIN=local \
    GOTELEMETRY=off \
    CARGO_NET_OFFLINE=true \
    npm_config_offline=true \
    PYTHONDONTWRITEBYTECODE=1 \
    DOTNET_CLI_TELEMETRY_OPTOUT=1

WORKDIR /work
USER 65534:65534
CMD ["sleep", "infinity"]
