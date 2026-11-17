#!/usr/bin/env bash
# Instala as skills de design usadas nos decks (hue, frontend-design, hallmark, impeccable,
# ui-ux-pro-max, interface-design, better-typography) a partir dos repositórios oficiais.
#
# Uso:
#   instalar-skills-design.sh            # em ~/.claude/skills (todas as sessões do usuário)
#   instalar-skills-design.sh --projeto  # em ./.claude/skills (só este projeto)
#   instalar-skills-design.sh --destino <pasta> [skill ...]   # pasta e skills específicas
#
# Não sobrescreve uma skill já instalada; use --forcar para substituir.
set -euo pipefail

DEST="$HOME/.claude/skills"; FORCAR=0; ESCOLHA=()
while [ $# -gt 0 ]; do
  case "$1" in
    --projeto) DEST="$PWD/.claude/skills" ;;
    --destino) DEST="$2"; shift ;;
    --forcar) FORCAR=1 ;;
    -h|--help) sed -n '2,11p' "$0"; exit 0 ;;
    *) ESCOLHA+=("$1") ;;
  esac
  shift
done

# nome | repositório | pasta da skill dentro do repositório (vazio = raiz)
SKILLS=(
  "hue|https://github.com/dominikmartn/hue|"
  "frontend-design|https://github.com/anthropics/skills|skills/frontend-design"
  "hallmark|https://github.com/Nutlope/hallmark|skills/hallmark"
  "impeccable|https://github.com/pbakaus/impeccable|plugin/skills/impeccable"
  "ui-ux-pro-max|https://github.com/nextlevelbuilder/ui-ux-pro-max-skill|.claude/skills/ui-ux-pro-max"
  "interface-design|https://github.com/Dammyjay93/interface-design|.claude/skills/interface-design"
  "better-typography|https://github.com/boraoztunc/skills|better-typography"
)

TMP=$(mktemp -d)
trap 'rm -rf -- "$TMP"' EXIT
mkdir -p "$DEST"

for linha in "${SKILLS[@]}"; do
  IFS='|' read -r nome repo sub <<< "$linha"
  if [ ${#ESCOLHA[@]} -gt 0 ] && [[ ! " ${ESCOLHA[*]} " =~ " $nome " ]]; then continue; fi
  alvo="$DEST/$nome"
  if [ -e "$alvo" ] && [ "$FORCAR" -eq 0 ]; then echo "• $nome já instalada em $alvo (use --forcar para substituir)"; continue; fi
  echo "• $nome ← $repo${sub:+ ($sub)}"
  src="$TMP/$nome"
  if [ -n "$sub" ]; then
    git clone -q --depth 1 --filter=blob:none --sparse "$repo" "$src"
    git -C "$src" sparse-checkout set --no-cone "/$sub/" >/dev/null
    origem="$src/$sub"
  else
    git clone -q --depth 1 "$repo" "$src"
    origem="$src"
  fi
  if [ ! -f "$origem/SKILL.md" ]; then echo "  ! SKILL.md não encontrado em $repo/$sub; pulando" >&2; continue; fi
  if [ -e "$alvo" ]; then rm -rf -- "$alvo"; fi
  mkdir -p "$alvo"
  (cd "$origem" && tar --exclude=.git -cf - .) | (cd "$alvo" && tar -xf -)
  # guarda a licença do repositório junto da skill, quando ela não vem na pasta
  if [ -n "$sub" ] && ! ls "$alvo"/LICENSE* >/dev/null 2>&1; then
    git -C "$src" sparse-checkout add '/LICENSE*' '/NOTICE*' >/dev/null 2>&1 || true
    for l in "$src"/LICENSE* "$src"/NOTICE*; do [ -f "$l" ] && cp "$l" "$alvo/"; done
  fi
  echo "  ok: $alvo"
done
echo "Pronto. Reinicie o Claude Code (ou abra uma nova sessão) para as skills aparecerem."
echo "HyperFrames (vídeo): siga o README de https://github.com/heygen-com/hyperframes."
