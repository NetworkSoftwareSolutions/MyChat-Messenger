 /**
 * Created by Gifer on 13.02.2017.
 */

 var Service    = require('./service.js');
 var console    = require('gifer-console');
 var Uploader   = require('./mcUploading').upload;

 exports.list = {
     "0"  : {
         pathWWW  : '/',
         host 	  : MCServer.Host,
         runFunc  : false,
         cache    : true,
         source	  : MCPathes.WWW + 'chat/'
     },
     "3"  : {
         pathWWW  : '/updates/',
         host 	  : MCServer.Host,
         runFunc  : false,
         source	  : function() {
             return MCPathes.Profile;
         }
     },
     "5"  : {
         pathWWW  : '/cmd/',
         host 	  : MCServer.Host,
         runFunc  : false,
         cache    : true,
         source	  : MCPathes.Service
     },
     "6"  : {
         pathWWW  : '/admin/',
         host 	  : MCServer.Host,
         redirect : '/admin',
         runFunc  : false,
         cache    : true,
         source	  : MCPathes.WWW
     },
     "9"  : {
         pathWWW  : '/wallpaper/',
         host 	  : MCServer.Host,
         runFunc  : false,
         cache    : true,
         source	  : MCPathes.WWW
     },
     "11" : {
         pathWWW  : '/downloads/',
         host 	  : MCServer.Host,
         runFunc  : false,
         source	  : function() {
             return MCPathes.ProfilNode;
         }
     },
     "12" : {
         pathWWW  : '/uploads/',
         host 	  : MCServer.Host,
         runFunc  : false,
         source	  : function() {
             return MCPathes.Profile;
         }
     },
     "13" : {
         pathWWW  : '/uploading',
         host 	  : MCServer.Host,
         hasParams: true,
         runFunc  : true,
         CallBack : Uploader
     },
     "14" : {
         pathWWW  : '/moment/',
         host 	  : MCServer.Host,
         cache    : true,
         source	  : MCPathes.NodeModules
     },
     "16" : {
         pathWWW  : '/textsource/',
         host 	  : MCServer.Host,
         cache    : true,
         source	  : MCPathes.Service
     },
     "17" : {
         pathWWW  : '/frameworks/',
         host 	  : MCServer.Host,
         cache    : true,
         source	  : MCPathes.Service
     },
     "18" : {
         pathWWW  : '/mctools/',
         host 	  : MCServer.Host,
         cache    : true,
         source	  : MCPathes.Service
     }
 };
