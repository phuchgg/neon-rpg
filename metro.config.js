const { getDefaultConfig } = require('expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

// ✅ Add support for `.cjs` files if needed (some Firebase deps use them)
defaultConfig.resolver.sourceExts.push('cjs');

// ✅ Optional (safe to leave)
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
