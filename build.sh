#!/bin/sh

rm -rf ./dist
yarn tsc -p tsconfig.dist.json --declaration
cp README.md package.json dist
cp -R jupiterone dist/
