var webpack = require('webpack');

var plugins = [];

plugins.push(new webpack.optimize.UglifyJsPlugin({
    minimize: false,
    compress: { warnings: false }
}));

module.exports = {
    entry: './dist/index.js',
    output: {
        path: __dirname,
        filename: 'web/raml-editor.js',
        libraryTarget: 'umd',
        library: ['RAML', 'Editor']
    }
};