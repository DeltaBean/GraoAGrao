#!/usr/bin/env bash
# =============================================================================
# buildx-create.sh
#
# Purpose
# -------
# Create a **dedicated BuildKit builder** named `bk-dns` whose workers always
# resolve DNS through the public nameservers defined in
# `buildkitd-dns.toml`.  It then makes that builder the default for the
# current Docker CLI *and* for all future shell sessions.
#
# Motivation
# ----------
# On some Linux setups (notably Ubuntu with `systemd-resolved`), Docker-BuildKit
# inherits a stub DNS address such as `192.168.15.1`.  Containers launched
# during `docker build` cannot reach that address, so commands like
# `go mod download` fail with “no such host” when they try to contact
# `proxy.golang.org` or `sum.golang.org`.
#
# By spinning up our **own** BuildKit instance and giving it a config file
# whose `[dns]` block lists `8.8.8.8` and `1.1.1.1`, every build step gets
# reliable name resolution—without disabling checksums, changing GOPROXY,
# or touching system-wide resolv.conf.
#
# How it works
# ------------
# 1. `docker buildx create` starts a BuildKit daemon inside a container
#    (`driver=docker-container`) and stores its metadata under
#    `$HOME/.docker/buildx`.
# 2. `--config buildkitd-dns.toml` injects the DNS servers.
# 3. `--bootstrap` launches the BuildKit container immediately.
# 4. `--use` marks `bk-dns` as the *current* builder for the Docker CLI.
# 5. The script appends `export BUILDX_BUILDER=bk-dns` to `~/.bashrc` so that
#    every new shell automatically targets this builder.
#
# Usage
# -----
#   chmod +x buildx-create.sh
#   ./buildx-create.sh        # run once; rerun only if you delete the builder
# =============================================================================

set -e  # Exit immediately on any error

docker buildx create \
  --name bk-dns \
  --driver docker-container \
  --config "${HOME}/GraoAGrao/.docker-config/buildkit/buildkitd-dns.toml" \
  --use \
  --bootstrap

# Persist the choice so future shells use bk-dns automatically
if ! grep -q 'BUILDX_BUILDER=bk-dns' "${HOME}/.bashrc"; then
  echo 'export BUILDX_BUILDER=bk-dns' >> "${HOME}/.bashrc"
fi
source "${HOME}/.bashrc"
