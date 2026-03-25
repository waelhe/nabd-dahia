#!/bin/bash
while true; do
  if [ ! -f /home/z/my-project/.next/dev/build/postcss.js ]; then
    mkdir -p /home/z/my-project/.next/dev/build
    ln -sf /home/z/my-project/node_modules/.postcss-turbopack.js /home/z/my-project/.next/dev/build/postcss.js
  fi
  sleep 0.1
done
