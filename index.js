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
        console.log('check');
        detail(checkServer());
      }
      var detail = function(status = true){
        var label_status = "Started";
          if(status){ //true es que esta apagado!
            label_status = "Stoped";
          }
          
          var menu = [
                  {
                  label: "Status: " + label_status,
                  enabled: false,
                },
                {
                  label: "Start Apache",
                  enabled: status,
                  click: function()
                  {
                    console.log("started");
                    shellSudo("start");
                    detail(false);
                    notifier.notify({
                      'title': '[AMANAGER]',
                      'subtitle': 'Server Started!',
                      'message': 'AManager start Apache server at localhost!',
                      sound: true,
                      timeout: 3
                    });
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
                    notifier.notify({
                      'title': '[AMANAGER]',
                      'subtitle': 'Server Stoped!',
                      'message': 'AManager stop Apache server!',
                      sound: true,
                      timeout: 3
                    });
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
                    notifier.notify({
                      'title': '[AMANAGER]',
                      'subtitle': 'Server Restarted!',
                      'message': 'AManager restart Apache server!',
                      sound: true,
                      timeout: 3
                    });

                  }
                },
                {
                  type: "separator"
                },
                {
                  label: "Go Localhost",
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
      var checkServer = function(){
        var check = false;
         var s = exec("ps ax | grep httpd | grep -v grep | cut -c1-5 | paste -s -", {async:true});
         s.stdout.on('data', function(data) {
            /* ... do something with data ... */
            console.log( 'iniciado');
            check = true;
          });
         return check;
      }
      var quitApp = function(){
        shellSudo("stop");
        app.quit();
      }

      start();
})