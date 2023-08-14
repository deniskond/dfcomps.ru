const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'apps/frontend/src/app/favicon.ico', to: 'favicon.ico' }],
    }),
  ],
};
