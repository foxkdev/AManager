'use strict';
const {app, Menu, Tray, shell, dialog} = require('electron')
const path = require('path')
const command = require('shelljs/global')
const sudo = require('sudo-prompt');
const fs = require('fs')

const notifier = require('node-notifier');

const trayActive = 'assets/trayIcon.png'
const iconNotification = 'assets/a_logo.png'
let tray = null


app.dock.hide()
app.on('ready', () =>
{
  tray = new Tray(path.join(__dirname, trayActive))
  

      var start = function(){
        console.log('check');
        checkServerApache(function(status){
          detail(status);
        });
      }
      var detail = function(status){
        var label_status = "Running";
          if(status){ //true es que esta apagado!
            label_status = "Stoped";
          }
        var label_mysql = "Running";
          
          var menu = [
                {
                  label: "Apache Server: " + label_status,
                  enabled: false,
                },
                {
                  type: "separator"
                },
                {
                  label: "Start Apache",
                  enabled: status, //apagado apache
                  click: function()
                  {
                    console.log("started");
                    shellSudo("start", function(){
                      detail(false);
                      notifier.notify({
                        title: '[AMANAGER]',
                        subtitle: 'Server Running!',
                        message: 'AManager start Apache server at localhost!',
                        icon: path.join(__dirname, iconNotification),
                        sound: true,
                        timeout: 3
                      });
                    });
                    
                  }
                },
                {
                  label: "Stop Apache",
                  enabled: !status, //encendido apache
                  click: function()
                  {
                    console.log("stoped");
                    shellSudo("stop", function(){
                      detail(true);
                      notifier.notify({
                        title: '[AMANAGER]',
                        subtitle: 'Server Stoped!',
                        message: 'AManager stop Apache server!',
                        icon: path.join(__dirname, iconNotification),
                        sound: true,
                        timeout: 3
                      });
                    });
                    
                  }
                },
                {
                  label: "Restart Apache",
                  enabled: !status,
                  click: function()
                  {
                    console.log("restarted");
                    shellSudo("restart", function(){
                      detail(false);
                      notifier.notify({
                        title: '[AMANAGER]',
                        subtitle: 'Server Restarted!',
                        message: 'AManager restart Apache server!',
                        icon: path.join(__dirname, iconNotification),
                        sound: true,
                        timeout: 3
                      });
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
                  dialog.showMessageBox({type: "question", buttons: ["Exit", "Continue"], title: 'Quit App', message: 'Are you sure to close AManager App?', detail: 'AManager close all Apache servers when close app', icon: path.join(__dirname, iconNotification)}, function(res){
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
      var shellSudo = function(shell, callback){
        var options = {
          name: 'AManager',
          icns: path.join(__dirname, trayActive), // (optional) 
        };
        sudo.exec("apachectl "+shell, options, function(error, stdout, stderr) {
          console.log('error: '+ error);
          console.log('out: ' + stdout);
          console.log('response: ' + stderr);
          return callback();
        });
      }
      var checkServerApache = function(callback){
         exec("ps ax | grep httpd | grep -v grep | cut -c1-5 | paste -s -", {silent: true,async: true}, function(code, stdout, stderr){
          console.log('Exit code:', code);
          console.log('Program output:', stdout);
          console.log('Program stderr:', stderr);
          var check = true;
          if(stdout == ""){
            console.log('empty');
            check = true; //apagado
          }else{
            check  = false; //encendido
          }
          return callback(check);
         });


      }
      var quitApp = function(){
        // shellSudo("stop");
        app.quit();
      }

      start();
})