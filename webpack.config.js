const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
        index: './src/index.js'
    },
    target: 'web',
    context: path.resolve(__dirname, ''),
    output: {
        filename: 'chart.js',
        path: path.resolve(__dirname, './dist'),
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js']
    },
    devServer: {
        contentBase: './src',
        stats: {
            version: true,
            timings: true,
            errors: true,
            warnings: true,
        },
        hot: true,
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    "presets": ["@babel/preset-env"],
                }
            }
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: '/Build',
            hash: true,
            template: './index.html',
            inject: 'body',
            filename: 'index.html'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new UglifyJsPlugin(),
    ],
};
