const fs = require('fs');
const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const nodeModulesPath = path.resolve(__dirname, 'node_modules')

function getModuleMappings() {
  let moduleMappings = {};

  function findPackageDirs(directory) {
    fs.readdirSync(directory).forEach(item => {
      const itemPath = path.resolve(directory, item);
      const itemStat = fs.lstatSync(itemPath);
      if (itemStat.isSymbolicLink()) {
        let linkPath = fs.readlinkSync(itemPath);
        // Sym links are relative in Unix, absolute in Windows.
        if (!path.isAbsolute(linkPath)) {
          linkPath = path.resolve(directory, linkPath);
        }
        const linkStat = fs.statSync(linkPath);
        if (linkStat.isDirectory()) {
          const packagePath = path.resolve(linkPath, 'package.json');
          if (fs.existsSync(packagePath)) {
            const packageId = path.relative(nodeModulesPath, itemPath);
            moduleMappings[packageId] = linkPath;
          }
        }
      } else if (itemStat.isDirectory()) {
        findPackageDirs(itemPath);
      }
    });
  }

  findPackageDirs(nodeModulesPath);

  return moduleMappings;
}

const moduleMappings = getModuleMappings();

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Register an "extra modules proxy" for resolving modules outside of the normal resolution logic.
    extraNodeModules: new Proxy(
      // Provide the set of known local package mappings.
      moduleMappings,
      {
        // Provide a mapper function, which uses the above mappings for associated package ids,
        // otherwise fall back to the standard behavior and just look in the node_modules directory.
        get: (target, name) => name in target ? target[name] : path.join(__dirname, `node_modules/${name}`),
      },
    ),
  },
  // Also additionally watch all the mapped local directories for changes to support live updates.
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        inlineRequires: true,
        experimentalImportSupport: false
      }
    })
  },
  watchFolders: Object.values(moduleMappings)
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config)
