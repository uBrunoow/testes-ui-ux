#!/usr/bin/env bash
# Gera um PDF (uma página 1920×1080 por slide) a partir do deck, com o Chrome headless.
# Uso: exportar-pdf.sh <deck.html> [saida.pdf]
set -euo pipefail
DECK=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
OUT=${2:-"${DECK%.html}.pdf"}
CHROME=${PW_CHROMIUM:-$(command -v google-chrome || command -v chromium || command -v chromium-browser || command -v chrome || true)}
if [ -z "$CHROME" ] && [ -d "/Applications/Google Chrome.app" ]; then CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; fi
if [ -z "$CHROME" ]; then echo "Chrome não encontrado. Defina PW_CHROMIUM=/caminho/do/chrome." >&2; exit 1; fi
"$CHROME" --headless=new --no-sandbox --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=8000 --run-all-compositor-stages-before-draw \
  --print-to-pdf="$OUT" "file://$DECK?pdf" 2>/dev/null
echo "PDF gerado: $OUT"
