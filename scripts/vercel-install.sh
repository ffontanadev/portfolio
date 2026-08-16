#!/usr/bin/env sh
# scripts/vercel-install.sh — Vercel's installCommand (see vercel.json)
#
# The production build prerenders the four locale routes with a headless
# Chromium (scripts/prerender.js, spec §8). Vercel's build image ships neither
# the browser nor its runtime libraries: `vercel-build` installs the binary,
# and this script installs the shared objects it links against — without
# libnspr4 the shell exits 127 before it can open a page.
#
# This lives in a file rather than inline in vercel.json because that field is
# capped at 256 characters.
set -e

PACKAGES="nss nss-util nspr atk at-spi2-atk at-spi2-core cups-libs dbus-libs
expat libdrm libX11 libXcomposite libXdamage libXext libXfixes libXrandr libxcb
libxkbcommon mesa-libgbm alsa-lib pango cairo"

# Tolerate a package manager or a package name that a future build image does
# not have: a failure here should surface as the prerender's own diagnostic,
# which names the missing library, rather than as an opaque install error.
dnf install -y $PACKAGES || yum install -y $PACKAGES || true

pnpm install
