 "use strict";

 var UglifyJS     = require('uglify-js');
 var fs           = require('fs');
 var Service     = require('../source/core/service/service');

 var LoadFile     = Service.LoadFile;
 var ExtractPath  = Service.ExtractPath;
 var StringToObj  = Service.StringToObj;

 var root = process.argv[3] ? ExtractPath(process.argv[3]).replace(/\\/g, '/') : "";
 var proj = process.argv[2];
 var res  = process.argv[3];

 function build(root, proj, res, cb){
    var WWW  = root + (root[root.length - 1] != '\\' ? '\\' : '');
    var serviceFolder = root + (root[root.length - 1] != '\\' ? '\\' : '');
    var fail = false;

    var concat   = function(list, cb){
        var result = "";

        list.forEach(function(item){
            try{
                result += fs.readFileSync(WWW + item);
            } catch (ePrev){
                try{
                    result += fs.readFileSync(serviceFolder + item);
                } catch (e){
                    console.log(ePrev.message);
                    console.log(e.message);

                    fail = true;
                }
            }
        });

        if (fail) {
            process.exit(1);
        }

        cb(result);
    };

    var dist = WWW + "source/js/";

    console.log(proj);
    console.log(res);
    console.log(dist);

    LoadFile(res, function(text){
        var list = StringToObj(text.replace('var MC_RESOURCE = ', ''));

        concat(list.Develop, function(contents){
            console.log("Concatenate complete");

            try {
                process.chdir(dist);
            } catch (err) {
                console.log('chdir: ' + err);
            }

            fs.writeFileSync(proj + ".js",contents);

            var name = proj + ".min.js";
            var files = {};
            files[name]= contents;
            
            var result = UglifyJS.minify(files, {
                warnings: true,
                toplevel: true,
                compress: {
                    dead_code: true
                },
                output   : {
                    ast : true,
                    code: true
                },
                sourceMap: {
                    url: proj + ".min.js.map"
                }
            });

            // var result = UglifyJS.minify(contents);

            if (result.error){
                
            } else {
                fs.writeFileSync(proj + ".min.js", result.code);
                fs.writeFileSync(proj + ".min.js.map", result.map);

                console.log("UglifyJS complete");
                if (cb) cb();

            }
        });
    }, 'utf-8');
 }

 if (res){
    build(root, proj, res);
 }

 exports.build = build;
