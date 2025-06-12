const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`

  // Configure for Node.js target without polyfills
  config.target = 'node';
  
  config.node = {
    __dirname: false,
    __filename: false,
  };

  // Disable all polyfills - use native Node.js modules
  config.resolve.fallback = false;

  // Add alias for @ew/shared
  config.resolve.alias = {
    ...config.resolve.alias,
    '@ew/shared': path.resolve(__dirname, '../../libs/shared/src')
  };

  return config;
}); 