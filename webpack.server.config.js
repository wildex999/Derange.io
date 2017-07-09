var path = require('path');
var nodeExternals = require('webpack-node-externals');

var node_modules = path.join(__dirname, 'node_modules');

module.exports = [{
    name: "Server",
    entry: "./src/server/app.ts",
    output: {
        filename: "server.js",
        path: __dirname + "/build"
    },
    target: "node",
    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".js", ".json"],
        alias: {
        }
    },

    module: {
        loaders: [
            {enforce: "pre", test: /\.js$/, loader: "source-map-loader"},
            {test: /p2\.js$/, loader: 'expose-loader?p2' },
            {test: /\.json$/, loader: "json-loader"},
            {
                test: /\.ts$/,
                loader: "awesome-typescript-loader"
            }
        ]
    },
    externals: [nodeExternals()]
}];