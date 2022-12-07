#!/usr/bin/env bash

DIST_PATH="$PWD/dist"
NODE_MODULES="$PWD/Example/node_modules"
PACKAGE_NAME="$(node -p 'require("./package.json").name')"
PACKAGE_IN_NODE_MODULES="$NODE_MODULES/$PACKAGE_NAME"

install_package() {
  uninstall_package

  yarn build

  mkdir -p "$PACKAGE_IN_NODE_MODULES"
  cp package.json "$PACKAGE_IN_NODE_MODULES"
  cp -r "$DIST_PATH" "$PACKAGE_IN_NODE_MODULES"

  echo "$PACKAGE_NAME installed."
}

uninstall_package() {
  rm -rf "$PACKAGE_IN_NODE_MODULES"

  if [ "$1" = true ]; then
    echo "$PACKAGE_NAME uninstalled."
  fi
}

if [ "$1" == "--install" ]; then
  install_package
elif [ "$1" == "--uninstall" ]; then
  uninstall_package true
fi
