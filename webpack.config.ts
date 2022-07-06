import * as path from 'path';
import * as webpack from 'webpack';
import 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Ssr } from './ssr-server';

const ssr = new Ssr();

const config: webpack.Configuration = {
  mode: process.env.NODE_ENV === 'production'? 'production' : 'development',
  entry: {
    index: './src/index.tsx'
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  devServer: {
    port: '8889',
    setupMiddlewares: (middleware, devServer)=> {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app?.get('/', async (_, response) => {
        const html = await ssr.ssrHtml('/');
        response.send(html);
      });

      return middleware;
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }],
              ['@babel/preset-react', { "runtime": "automatic" }],
              '@babel/preset-typescript'
            ],
            plugins: [
              ['babel-plugin-styled-components', { ssr: true }]
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      templateParameters: {
        ssrHTML: '<%- ssrHTML %>',
        ssrSTYLE: '<%- ssrSTYLE %>',
        ssrDATA: '<%- ssrDATA %>'
      },
      inject: 'body'
    }),
    ssr.getWebpackPlugin(),
    new webpack.DefinePlugin({
      SITE: JSON.stringify('client')
    })
  ]
};

export default config;
