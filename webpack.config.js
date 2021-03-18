const path = require("path");

module.exports = {
    entry: {
        test: './src/cindex.ts'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader'
        }]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: 'test'
    }
}