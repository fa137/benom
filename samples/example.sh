#!/usr/bin/env bash
# Example shell script for the Benom theme.
#
# Exercises comments, strings, escapes, numbers, keywords,
# functions, variables, properties and operators.

set -euo pipefail

readonly MAX_RETRIES=3
readonly GREETING="hello world"
readonly ESCAPED="quote: \" tab:$(printf '\t') newline:$(printf '\n')"

log() {
  local level="$1"
  shift
  printf '[%s] %s\n' "$level" "$*" >&2
}

fetch() {
  local url="$1"
  local attempt=1
  while (( attempt <= MAX_RETRIES )); do
    if curl -fsS --max-time 5 "$url" >/dev/null 2>&1; then
      log info "fetched $url (attempt $attempt)"
      return 0
    fi
    attempt=$(( attempt + 1 ))
  done
  log error "failed $url after $MAX_RETRIES attempts"
  return 1
}

sum() {
  local total=0
  local n
  for n in "$@"; do
    total=$(( total + n ))
  done
  printf '%d\n' "$total"
}

main() {
  local name="${1:-benom}"
  log info "$GREETING from $name"
  fetch "https://example.test/?v=0.5"
  local result
  result="$(sum 1 2 3 4 5)"
  printf 'sum=%s hex=0x%x octal=0%o float=%.2f\n' "$result" 255 17 0.5
  [[ "$name" == b* ]] && log info "starts with b" || log info "does not"
}

main "$@"
