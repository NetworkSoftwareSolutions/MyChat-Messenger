 /**
 * Created by Gifer on 31.08.2016.
 */

 "use strict";

 var TRAY       = {};
 var appTray    = null;
 var trayMenu   = null;
 var electron   = null;
 var mainWindow = null;
 var images     = {
     mychat: null,
     empty : null,
     post  : null
 };
 // var blinkInterval = null;
 var breakBlink = false;
 var nativeImage= null;
 var blinking   = false;

 const BLINKTIMEOUT = 500;

 TRAY.init = function (_electron, _mainWindow) {
     electron   = _electron;
     mainWindow = _mainWindow;

     nativeImage = electron.nativeImage;

     images.mychat = nativeImage.createFromPath(`${MCPathes.Images}small_logo.png`);
     images.empty  = nativeImage.createFromPath(`${MCPathes.Images}empty32.png`);
     images.post   = nativeImage.createFromPath(`${MCPathes.Images}post32.png`);

     appTray  = new electron.Tray(images.mychat);

     trayMenu = electron.Menu;

     appTray.setPressedImage(images.mychat);

     appTray.setToolTip('MyChat Client');
 };

 TRAY.trayMenu = function (menuItems) {
     let contextMenu = trayMenu.buildFromTemplate(menuItems);

     appTray.setContextMenu(contextMenu);
 };

 TRAY.setEvent = function (event, action) {
     appTray.on(event, action);
 };

 TRAY.removeEvent = function (event) {
     //todo: make it
 };

 TRAY.clearBlink = function () {
     breakBlink = true;
 };

 TRAY.isBlinking = function () {
     return blinking;
 };

 TRAY.blinkPost = function () {
     if (!breakBlink) {
         blinking = true;

         appTray && appTray.setImage(images.empty);

         setTimeout(function () {
             appTray && appTray.setImage(images.post);

             if (breakBlink) TRAY.blinkPost(); else
             setTimeout(function () {
                 appTray && appTray.setImage(images.empty);

                 if (breakBlink) TRAY.blinkPost(); else
                 setTimeout(function () {
                     appTray && appTray.setImage(images.post);

                     if (breakBlink) TRAY.blinkPost(); else
                     setTimeout(function () {
                         appTray && appTray.setImage(images.empty);

                         if (breakBlink) TRAY.blinkPost(); else
                         setTimeout(function () {
                             appTray && appTray.setImage(images.mychat);

                             setTimeout(TRAY.blinkPost, BLINKTIMEOUT);
                         }, BLINKTIMEOUT);
                     }, BLINKTIMEOUT);
                 }, BLINKTIMEOUT);
             }, BLINKTIMEOUT);
         }, BLINKTIMEOUT);
     } else {
         breakBlink = false;
         blinking   = false;

         appTray.setImage(images.mychat);
     }
 };

 TRAY.showIcon = function (icon) {
     if (images.hasOwnProperty(icon)){
         appTray.setImage(images[icon]);
     } else {
         appTray.setImage(images.mychat);
     }
 };

 TRAY.hide = function () {
     appTray.destroy();
     appTray = null;
 };

 TRAY.hasTray = function () {
     return !!appTray;
 };


 module.exports = TRAY;