#!/usr/bin/env node

'use strict'

var concat = require('concat-stream');
var http = require('http')
var url = require('url')
var fs = require('fs')
var tty = require('tty');
var open = require("open");

var webpack = require('webpack')
var React = require('react')

function getPropsFromStdin (cb) {
  if (tty.isatty(process.stdin)) return cb(null, {})

  process.stdin.pipe(concat(raw => {
    try {
      cb(null, JSON.parse(raw))
    }
    catch (e) {
      cb(e)
    }
  }))
}

class ReactView{

  constructor(props={}){
    var componentPath = process.cwd()
    var componentName = process.argv[2]
    var fullPath = `${componentPath}/${componentName}`

    this.port = process.argv[3] || 1337
    this.fullPath = fullPath
    this.bundle = `${__dirname}/component/bundle.js`

    this.compiler = webpack({
      context: __dirname,
      entry: fullPath,
      output: {
           path: __dirname + "/component",
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
                  loader: 'render-placement-loader',
                  query: { props: props }
              },
              { 
                test: /\.css$/,
                loader: "style-loader!css-loader" 
              },

          ]
      },
      resolve: {
          extensions: ['', '.js', '.jsx']
      }
    })

    this.compile()

  }

  compile(){
    this.compiler.run(function(err, stats) {
      if(err)
          return console.log(err);
      
      var jsonStats = stats.toJson();
      
      if(jsonStats.errors.length > 0)
         return console.log(jsonStats.errors);
      
      if(jsonStats.warnings.length > 0)
         console.log(jsonStats.warnings);
        
      this.serve()
    }.bind(this));
  }

  serve(){
    http.createServer(function (req, res) {

      var location = url.parse(req.url,true).pathname

      if(location == '/bundle.js'){
        fs.readFile(this.bundle, function(error, content) {
          if (error) {
            res.writeHead(500);
            res.end();
          }
          else {
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            res.end(content, 'utf-8');
          }
        });
      }
      else {
        res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
        res.end('<html><head><title>React View</title></head><body><script src="/bundle.js"></script></body></html>')
      }
    }.bind(this)).listen(this.port);
    open('http://localhost:'+ this.port);
    console.log('running!')
  }
}

getPropsFromStdin((err, props) => {
  if (err) throw err
  new ReactView(props)
});
