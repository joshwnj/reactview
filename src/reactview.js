#!/usr/bin/env node

require('babel/polyfill')

var http = require('http')
var url = require('url')
var fs = require('fs')
var open = require("open")

var webpack = require('webpack')
var WebpackDevServer = require("webpack-dev-server")

var React = require('react')


class ReactView{

  constructor(){
    var componentPath = process.cwd()
    var componentName = process.argv[2]
    var fullPath = `${componentPath}/${componentName}`

    this.port = process.argv[3] || 8880
    this.fullPath = fullPath
    this.bundle = `${__dirname}/component/bundle.js`

    this.compiler = webpack({
      context: __dirname,
      entry:  ['webpack/hot/dev-server', fullPath],
      output: {
           path: `${__dirname}/component`,
           publicPath: "http://localhost:9090/assets/",
           filename: "bundle.js"
      },
      module: {
          loaders: [
              {
                  test: /\.jsx$/,
                  loader: 'babel-loader?stage=0'
              },
              {
                  test: /\.jsx$/,
                  loader: 'render-placement-loader'
              },
              { 
                test: /\.css$/,
                loader: "style-loader!css-loader" 
              },

          ]
      },
      resolve: {
          extensions: ['', '.js', '.jsx']
      },
      plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
      ]
    })

    this.compile()
      .then(() => {
        this.serve()
      })

  }

  compile(){

    var promise = new Promise((resolve, reject) => {
      
      this.compiler.watch({ // watch options:
        aggregateTimeout: 300, // wait so long for more changes
        poll: true // use polling instead of native watchers
        // pass a number to set the polling interval
      },
      function(err, stats) {
        if(err) {
          console.log(err)
          return reject()
        }
        
        var jsonStats = stats.toJson()
        
        if(jsonStats.errors.length > 0) {
          console.log(jsonStats.errors)
          return reject()
        }

        if(jsonStats.warnings.length > 0) {
          console.log(jsonStats.warnings)
          return reject()
        }
        console.log('Successfully Compiled')
        return resolve(true)
      })

    })
    return promise
  }

  serve(){
  var server = new WebpackDevServer(this.compiler, {
    // webpack-dev-server options
    contentBase: `${__dirname}/component/`,
    // or: contentBase: "http://localhost/",

    hot: true,
    publicPath: '/assets/',
    // Enable special support for Hot Module Replacement
    // Page is no longer updated, but a "webpackHotUpdate" message is send to the content
    // Use "webpack/hot/dev-server" as additional module in your entry point
    // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does. 

    // Set this as true if you want to access dev server from arbitrary url.
    // This is handy if you are using a html5 router.
    historyApiFallback: false,

    // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
    // Use "*" to proxy all paths to the specified server.
    // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
    // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).
    proxy: {
      "*": "http://localhost:9090"
    }
  })

  server.listen(this.port, "localhost", function() {});
  open(`http://localhost:${this.port}/webpack-dev-server`);
  console.log(`Server Started on port ${this.port}`)
  }
}
new ReactView()
