const { app, BrowserWindow, nativeTheme, Menu, shell } = require('electron');
const path = require('path');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');
  mainWindow.maximize();
  nativeTheme.themeSource = 'dark';
  Menu.setApplicationMenu(Menu.buildFromTemplate([{
    label: app.name,
    submenu: [
      { label: 'About photopea', click() { shell.openExternal("https://github.com/photopea/photopea/blob/master/README.md#photopeacom") } },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
      {
        label: 'Keyboard Shortcuts',
        submenu: [
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      }
    ]
  }]));

}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length == 0) createWindow();
  });
});

app.on('window-all-closed', function () { app.quit() });
