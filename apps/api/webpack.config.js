const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`

  // Disable node polyfills since we're targeting Node.js
  config.node = {
    __dirname: false,
    __filename: false,
  };

  // Set the target to node
  config.target = 'node';

  // Disable the webpack 'fs' polyfill
  config.resolve.fallback = {
    fs: false,
    path: false,
    crypto: false,
  };

  // Add alias for @ew/shared
  config.resolve.alias = {
    ...config.resolve.alias,
    '@ew/shared': path.resolve(__dirname, '../../libs/shared/src')
  };

  return config;
}); 