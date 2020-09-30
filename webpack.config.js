const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './index.js',
    v2: './v2.js'
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
      filename: 'index.html',
      title: 'JReact Demo',
      template: './public/index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'v2.html',
      title: 'TReact Demo',
      template: './public/index.html',
      chunks: ['v2']
    }),
  ]
}