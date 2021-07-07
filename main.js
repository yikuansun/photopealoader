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
}

function setMenu() {
  var template = [
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
  ];

  if (process.platform == "darwin") {
    template.unshift({
      label: app.name,
      submenu: [
        { label: 'About Photopea', click() { shell.openExternal("https://github.com/photopea/photopea/blob/master/README.md#photopeacom") } },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createWindow();
  setMenu();
});

app.on('window-all-closed', function () { app.quit() });
