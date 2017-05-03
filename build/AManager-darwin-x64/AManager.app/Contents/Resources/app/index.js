'use strict';
const {app, Menu, Tray, shell, dialog} = require('electron')
const path = require('path')
const command = require('shelljs/global')
const sudo = require('sudo-prompt');
const fs = require('fs')

const notifier = require('node-notifier');

 const trayActive = 'assets/trayIcon.png'

let tray = null


app.dock.hide()
app.on('ready', () =>
{
  tray = new Tray(path.join(__dirname, trayActive))
  

      var start = function(){
        shellSudo("stop"); //inicia apagado
        //mostramos el apagado
        detail(true);
      }
      var detail = function(status = true){
          
          var menu = [
                {
                  label: "Start Apache",
                  enabled: status,
                  click: function()
                  {
                    console.log("started");
                    shellSudo("start");
                    detail(false);
                  }
                },
                {
                  label: "Stop Server",
                  enabled: !status,
                  click: function()
                  {
                    console.log("stoped");
                    shellSudo("stop");
                    detail(true);
                  }
                },
                {
                  label: "Restart Server",
                  enabled: !status,
                  click: function()
                  {
                    console.log("restarted");
                    shellSudo("restart");
                    detail(false);
                  }
                },
                {
                  type: "separator"
                },
                {
                  label: "Go Localhost",
                  enabled: !status,
                  click: function()
                  {
                    console.log("go localhost");
                    shell.openExternal('http://localhost');                    
                  }
                }];

              menu.push({
                type: "separator"
              })
              menu.push({
                label: 'Version: '+app.getVersion(),
                enabled: false
              })
              menu.push({
                label: 'About',
                click: function(){
                  shell.openExternal('https://github.com/kloppz')
                }
              })
              menu.push({
                label: 'Quit',
                click: function(){
                  dialog.showMessageBox({type: "question", buttons: ["Exit", "Continue"], title: 'Quit App', message: 'Are you sure to close AManager App?', detail: 'AManager close all Apache servers when close app'}, function(res){
                    console.log(res)
                    if(res == 0){
                      quitApp();
                    }
                  })
                  //quitApp()
                }
              })

              var contextMenu = Menu.buildFromTemplate(menu);
              tray.setToolTip('Apache Manager');
              tray.setContextMenu(contextMenu);
      }
      var setStatus = function(callback, init = false, status = false){
        var shell = "stop";

        if(init != true){
          if(status){
            console.log('start');
            shell = "stop";
            status = false;
          }else{
            console.log('stop');
            shell = "start";
            status = true;
          }
        }else{
          shell = "start";
          status = false;
        }
        shellSudo(shell);
        return callback(status);
      };
      var shellSudo = function(shell){
        var options = {
          name: 'AManager',
          icns: path.join(__dirname, trayActive), // (optional) 
        };
        sudo.exec("apachectl "+shell, options, function(error, stdout, stderr) {
          console.log('error: '+ error);
          console.log('out: ' + stdout);
          console.log('response: ' + stderr);
        });
      }
      var quitApp = function(){
        shellSudo("stop");
        app.quit();
      }

      start();
})