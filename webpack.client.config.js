var path = require('path');

module.exports = {
    name: "Client",
    entry: "./src/client/app.ts",
    output: {
        filename: "game.js",
        path: __dirname + "/build"
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".js", ".json"],
        alias: {
            "phaser": "phaser-ce",
            pixi: path.join(__dirname, "node_modules/phaser-ce/build/custom/pixi.js"),
            p2: path.join(__dirname, "node_modules/phaser-ce/build/custom/p2.js"),
        }
    },

    module: {
        loaders: [
            {enforce: "pre", test: /\.js$/, loader: "source-map-loader"},
            { test: /pixi\.js$/, loader: 'expose-loader?PIXI' },
            { test: /p2\.js$/, loader: 'expose-loader?p2' },
            { test: require.resolve("phaser-ce"), loader: 'expose-loader?Phaser' },
            { test: require.resolve("socket.io-client"), loader: 'expose-loader?io'},
            { test: /\.ts?$/, loader: "awesome-typescript-loader"},
        ]
    },

    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
};