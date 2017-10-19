var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var webpack = require('webpack');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');

module.exports = {
    //页面入口文件配置
    entry: [APP_PATH + '/app.js'],
    //出口文件输出配置
    output: {
        path: BUILD_PATH,
        filename: 'bundle.js'
    },
    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        port: '9090'
    },
    devtool: 'eval-source-map',
    resolve: {
        alias: {
            'react': pathToReact
        }
    },
    module: {
        //加载器配置
        loaders: [{
            test: /\.css$/,
            loader: 'style-loader!css-loader',
            include: APP_PATH
        }, {
            test: /\.scss$/,
            loader: 'style-loader!css-loader!sass-loader',
            include: APP_PATH
        }, {
            test: /\.jsx?$/,
            include: APP_PATH,
            loader: 'babel-loader',
            query: {
                presets: ['react', 'es2015']
            }
        }, {
            test: /\.(png|jpg|woff|svg|gif|ttf|eot)$/,
            loader: 'url-loader?limit=8192'
        }],
        noParse: [pathToReact]
    },
    //其它解决方案配置
    resolve: {
        //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
        extensions: ['.js', '.json', '.scss'],
        //表示所有模块的启始目录由当前目录开始
        // modulesDirectories: ['.']
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
    externals: {
        'OSS': 'window.OSS',
    }
};
