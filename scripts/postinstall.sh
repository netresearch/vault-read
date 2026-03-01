#!/bin/sh
# Fix node-vault compatibility with got v14:
# 1. CJS/ESM interop: node-vault does require('got') but got v14 is ESM
# 2. API compat: node-vault uses got v9 options that don't exist in got v14
VAULT_INDEX="node_modules/node-vault/src/index.js"
if [ -f "$VAULT_INDEX" ]; then
  # Fix CJS/ESM interop for got
  sed -i "s/const got = require('got');/const _gotModule = require('got'); const got = _gotModule.default || _gotModule;/" "$VAULT_INDEX"
  # Fix got v9 → v14 API: resolveWithFullResponse → removed (v14 default)
  sed -i "s/resolveWithFullResponse: true,//" "$VAULT_INDEX"
  # Fix got v9 → v14 API: simple: false → throwHttpErrors: false
  sed -i "s/simple: false,/throwHttpErrors: false,/" "$VAULT_INDEX"
  # Fix got v9 → v14 API: uri option → delete (URL already passed as 1st arg)
  sed -i "s/options.uri = uri;/delete options.uri;/" "$VAULT_INDEX"
  # Fix got v9 → v14 API: response.request.path → response.request.options.url.pathname
  sed -i "s/response\.request\.path/((response.request.options \&\& response.request.options.url \&\& response.request.options.url.pathname) || '')/" "$VAULT_INDEX"
fi
