const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      config.resolve.mainFields = ['browser', 'module', 'main'];
    }
    // Webpack のカスタム設定をここに追加
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    config.resolve.alias['components'] = path.join(__dirname, 'components');
    config.resolve.alias['public'] = path.join(__dirname, 'public');
    return config;
  },
};

module.exports = nextConfig;
