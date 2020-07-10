const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const miniCssExtractPlugin = require('mini-css-extract-plugin');

let debug = true;

module.exports = {
    entry: {
        header: './views/header/header.js',
        home: './views/home/home.js',
        words: './views/words/words.js',
        book: './views/book/book.js',
        film: './views/film/film.js',
        backstage: './views/backstage/backstage.js',
        iSay: './views/iSay/iSay.js',
        about: './views/about/about.js',
    },
    output: {
        filename: 'js/[name].[chunkhash].js',
        path: path.resolve(__dirname, '../static/out/'),
        publicPath: '/static/out/'
    },
    module: {
        rules: [
            {test: /\.js$/, include: [path.resolve(__dirname, '')], exclude:/node_modules/, use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015',[
                                "babel-preset-env",
                                {useBuiltIns: "entry"}
                            ]],
                            // import()动态导入
                            plugins: ['dynamic-import-webpack']
                        }
                    }
            ]},
            {test: /\.vue$/, use: ['vue-loader']},
            {test: /\.scss$/, use: [miniCssExtractPlugin.loader, 'css-loader', 'sass-loader']},
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new VueLoaderPlugin(),
        new miniCssExtractPlugin({
            filename: 'css/[name].[chunkhash].css'
        }),
        new htmlWebpackPlugin({
            filename: `../../templates/plugin/header.html`,
            template: `./views/header/header.html`,
            chunks: ['header'],
            debug: debug,
            inject: false
        }),
        ...genHtmlPlugin('home', 'words', 'book', 'film', 'backstage', 'about', 'iSay'),
    ],
    mode: 'development',
    optimization: {
        splitChunks:{
            chunks: "initial",
            minSize: 0,
            minChunks: 2,
            cacheGroups: {
                // vue_js: {
                //     priority: 0,
                //     chunks: "initial",
                //     test: /\.[\\/]components[\\/].+[\\/].+\.js$/,
                //     filename: "js/[name].[chunkhash].js",
                //     minSize: 0,
                //     minChunks: 2,
                //     enforce: true,
                //     reuseExistingChunk: true
                // }
            }
        }
    },
    resolve: {
        alias: {
            // vue别名
            'vue$': 'vue/dist/vue.esm.js',
            '@components': path.resolve('./components'),
            '@vendor': path.resolve('./js_vendor'),
            '@static': path.resolve('../static'),
            '@views': path.resolve('./views'),
        }
    },
};

function genHtmlPlugin(...lis) {
    let re = [];
    for (let s of lis){
        re.push(
            new htmlWebpackPlugin({
                filename: `../../templates/${s}.html`,
                template: `./views/${s}/${s}.html`,
                chunks: [s],
                inject: false
            })
        )
    }
    return re
}