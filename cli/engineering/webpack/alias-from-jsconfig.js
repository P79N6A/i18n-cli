const path = require('path');
const readJsConfig = require("../../lib/read-js-config");

const aliasFromJsConfig = (appPath) => {
  let jsConfig;
  try {
    jsConfig = readJsConfig(appPath);
  }
  catch (err) {
    console.warn('=============', err.message);
    return {};
  }

  // @see https://www.typescriptlang.org/docs/handbook/module-resolution.html
  const { baseUrl = null, paths = null } = jsConfig.compilerOptions || {};
  if (!baseUrl || !paths) {
    return {};
  }

  let alias = {};

  for (let [name, mapping] of Object.entries(paths)) {
    if (!mapping || !Array.isArray(mapping) || mapping.length != 1) {
      console.warn(`[Tea] Cannot resolve path mapping at jsconfig.json: compilerOptions.path["${name}"]`);
      console.warn(`      A valid path mapping should have value of single element array, e.g: `);
      console.warn(`      ["../node_modules/@tencent/tea-app"]`);
    }
    else {
      let [aliasPath] = mapping;
      // WebPack 不支持通配，但是默认就是通配了，直接把通配符去掉
      name = name.replace(/\/\*$/, '');
      aliasPath = aliasPath.replace(/\/\*$/, '');
      alias[name] = path.resolve(appPath, baseUrl, aliasPath);
    }
  }

  return alias;
};

module.exports = aliasFromJsConfig;