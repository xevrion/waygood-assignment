#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${GIT_SHA:-}" ]]; then
  echo "GIT_SHA is required"
  exit 1
fi

overlay_file="infra/overlays/staging/kustomization.yaml"

perl -0pi -e "s/newTag: staging/newTag: ${GIT_SHA}/g" "${overlay_file}"

echo "Updated ${overlay_file} to ${GIT_SHA}"

