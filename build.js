var babel = require('babel-core')
var fs = require('fs')

babel.transformFile('./src/reactview.js', {stage: 0}, function (err, result) {
	if(err) return console.log(err)
  fs.writeFile('./bin/reactview.js', result.code, function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("Compiled src/reactview to bin");
  }); 
});