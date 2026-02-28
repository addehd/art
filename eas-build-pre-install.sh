#!/usr/bin/env bash
set -euo pipefail

corepack enable
corepack prepare yarn@4.12.0 --activate
