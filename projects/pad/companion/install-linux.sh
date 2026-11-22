#!/usr/bin/env bash
set -euo pipefail

COMPANION_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="$(command -v node || true)"

if [[ -z "${NODE_BIN}" ]]; then
  echo "✗ No se encontró 'node' en PATH. Instalá Node.js 18+ primero."
  exit 1
fi

echo "→ Compilando pad-companion en ${COMPANION_DIR}..."
npm --prefix "${COMPANION_DIR}" run build

if [[ ! -f "${COMPANION_DIR}/config.json" ]]; then
  cp "${COMPANION_DIR}/config.example.json" "${COMPANION_DIR}/config.json"
  echo "→ Creado ${COMPANION_DIR}/config.json desde config.example.json (recordá cargar tu token API/OTA)."
fi

UNIT_DIR="${HOME}/.config/systemd/user"
BIN_DIR="${HOME}/.local/bin"
mkdir -p "${UNIT_DIR}" "${BIN_DIR}"

cat > "${UNIT_DIR}/pad-companion.service" <<EOF
[Unit]
Description=HIOS PAD Companion Daemon (telemetría local + UI mirror)
After=network-online.target pipewire.service pulseaudio.service

[Service]
Type=simple
WorkingDirectory=${COMPANION_DIR}
ExecStart=${NODE_BIN} ${COMPANION_DIR}/dist/index.js --config ${COMPANION_DIR}/config.json
Restart=on-failure
RestartSec=4
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
EOF

cat > "${BIN_DIR}/pad-companion" <<EOF
#!/usr/bin/env bash
set -euo pipefail
CMD="\${1:-status}"
case "\${CMD}" in
  start|stop|restart|status)
    systemctl --user "\${CMD}" pad-companion.service
    ;;
  logs)
    journalctl --user -u pad-companion.service -f -n 40
    ;;
  run)
    exec "${NODE_BIN}" "${COMPANION_DIR}/dist/index.js" --config "${COMPANION_DIR}/config.json"
    ;;
  bt-release)
    HOST=\$(node -e "const c=require('${COMPANION_DIR}/config.json');console.log(c.host||'hiospad.local')")
    TOK=\$(node -e "const c=require('${COMPANION_DIR}/config.json');console.log(c.token||'')")
    curl -sS -X POST "http://\${HOST}/api/cmd" -H "Content-Type: application/json" -H "X-Pad-Token: \${TOK}" -d '{"btRelease":true}'
    echo ""
    ;;
  *)
    echo "Uso: pad-companion {start|stop|restart|status|logs|run|bt-release}"
    exit 1
    ;;
esac
EOF
chmod +x "${BIN_DIR}/pad-companion"

systemctl --user daemon-reload
systemctl --user enable --now pad-companion.service

echo "✓ Servicio systemd de usuario instalado y corriendo en background (arranca solo al iniciar sesión)."
echo "✓ Comando global instalado en ${BIN_DIR}/pad-companion:"
echo "    pad-companion status      # ver estado"
echo "    pad-companion logs        # ver logs en vivo"
echo "    pad-companion restart     # reiniciar daemon"
echo "    pad-companion bt-release  # liberar Bluetooth del PAD por red"
