#!/usr/bin/env bash

PACKAGE_NAME="$(node -p 'require("./package.json").name')"
PACKAGE_VERSION="$(node -p 'require("./package.json").version')"
TARBALL_PATH="$PWD/$PACKAGE_NAME-v$PACKAGE_VERSION.tgz"

yarn build
yarn pack
yarn publish "$TARBALL_PATH" --new-version "$PACKAGE_VERSION"
rm "$TARBALL_PATH"
