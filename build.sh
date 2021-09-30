#!/bin/sh

rm -rf ./dist
yarn tsc -p tsconfig.dist.json --declaration
cp README.md dist/README.md
cp -R jupiterone dist/
