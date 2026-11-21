#!/bin/bash
# generate a group of problem batches in parallel
cd /workspace
for t in "$@"; do
  echo "$t"
done | xargs -P 6 -I{} sh -c 'python3 work/64cha-byaa/gen/gen.py $(echo {} | cut -d, -f1) $(echo {} | cut -d, -f2) 2'
