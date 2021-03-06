var fs    = require('fs');
var path  = require('path');
var ncp   = require('./ncp');
var mkdir = require('../mkdirs');

function copy(src, dest, options, callback) {
    if (typeof options === 'function' && !callback) {
        callback = options;
        options = {}
    } else if (typeof options === 'function' || options instanceof RegExp) {
        options = {filter: options}
    }
    
    callback = callback || function () {
    };

    fs.lstat(src, function (err, stats) {
        if (err) return callback(err);

        var dir = null;

        if (stats.isDirectory()) {
            var parts = dest.split(path.sep);
            parts.pop();
            dir = parts.join(path.sep)
        } else {
            dir = path.dirname(dest)
        }

        fs.exists(dir, function (dirExists) {
            if (dirExists) return ncp(src, dest, options, callback);

            mkdir.mkdirs(dir, function (err) {
                if (err) return callback(err);
                
                ncp(src, dest, options, callback)
            })
        })
    })
}

module.exports = copy
