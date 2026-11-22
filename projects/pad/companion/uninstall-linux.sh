#!/usr/bin/env bash
set -euo pipefail

systemctl --user disable --now pad-companion.service 2>/dev/null || true
rm -f "${HOME}/.config/systemd/user/pad-companion.service"
rm -f "${HOME}/.local/bin/pad-companion"
systemctl --user daemon-reload

echo "✓ Servicio pad-companion y comando CLI desinstalados."
