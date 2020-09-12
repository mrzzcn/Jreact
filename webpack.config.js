const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './index.js'
  },
  mode: 'development',
  devServer: {
    contentBase: './dist',
  },
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [['@babel/plugin-transform-react-jsx', { pragma: 'Jreact.createElement' }]]
        }
      }
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Jreact Demo',
    }),
  ]
}