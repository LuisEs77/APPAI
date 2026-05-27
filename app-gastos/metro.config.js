const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure asset extensions are properly registered
config.resolver.assetExts.push(
  'db',
  'mp3',
  'ttf',
  'otf',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
);

config.resolver.sourceExts = [
  'web.ts',
  'web.tsx',
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
];

module.exports = config;
