const { app, BrowserWindow, nativeTheme, Menu, shell, dialog } = require('electron');
const fs = require('fs');
const ipcMain = require('electron').ipcMain;
const isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == 'true') : false;
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main');
const path = require('path');
// setup the titlebar main process
setupTitlebar();

let globals = {};

app.on('open-file', function (event, filePath) {
  globals.openedFile = fs.readFileSync(filePath).buffer;
  globals.openedFilePath = path.join(__dirname, filePath);
});

function getUserData() {
  if (!fs.existsSync(app.getPath('documents') + '/Photopea files')) fs.mkdirSync(app.getPath('documents') + '/Photopea files');
  if (!fs.existsSync(app.getPath('documents') + '/Photopea files/Plugins')) fs.mkdirSync(app.getPath('documents') + '/Photopea files/Plugins');
  if (!fs.existsSync(app.getPath('documents') + '/Photopea files/Resources')) fs.mkdirSync(app.getPath('documents') + '/Photopea files/Resources');
  if (!fs.existsSync(app.getPath('documents') + '/Photopea files/config.json')) fs.writeFileSync(app.getPath('documents') + '/Photopea files/config.json', "{\n    \n}");

  var jsonconfig = fs.readFileSync(`${app.getPath('documents')}/Photopea files/config.json`, 'utf-8');
  globals.options = JSON.parse(jsonconfig);

  globals.resources = [];
  for (var resource of fs.readdirSync(`${app.getPath('documents')}/Photopea files/Resources`)) {
    var fileext = resource.split('.').pop();
    if (!(['md', 'DS_Store'].includes(fileext))) globals.resources.push(fs.readFileSync(`${app.getPath('documents')}/Photopea files/Resources/${resource}`).buffer);
  }
  if (globals.options.environment) globals.options.environment.plugins = [];
  else {
    globals.options.environment = {
      plugins: []
    };
  };
  // globals.otions.plugins = [];
  for (var file of fs.readdirSync(`${app.getPath('documents')}/Photopea files/Plugins`)) {
    var fileext = file.split('.').pop();
    if (fileext.toLowerCase() == "json") {
      globals.options.environment.plugins.push(JSON.parse(fs.readFileSync(`${app.getPath('documents')}/Photopea files/Plugins/${file}`, 'utf-8')));
    }
  }

  globals.options.enableIO = true;
  
  if (process.argv.length >= 2) {
    // console.log(process.argv)
    var filePath = process.argv[isDev ? 2 : 1];
    fs.readFile(filePath, null, function (err, data) {
      if (err) console.log(err);
      if (data) {
        globals.openedFile = data.buffer;
        globals.openedFilePath = path.join(__dirname, filePath);
      };
    });
  }
}

function createWindow() {
  var mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 900,
    titleBarStyle: "hidden",
    frame: process.platform == "darwin",
    webPreferences: {
      //   nodeIntegration: true,
      // contextIsolation: false,
      // enableRemoteModule: true,
      preload: `${__dirname}/preload.js`
    }
  });

  ipcMain.handle("readyToShow", function(e, data) {
    mainWindow.show();
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('window/index.html');
  mainWindow.maximize();
  mainWindow.webContents.on('new-window', function (e, url) {
    console.log('new window');
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
  nativeTheme.themeSource = 'dark';

  isDev && mainWindow.webContents.openDevTools();

  //attach fullscreen(f11 and not 'maximized') && focus listeners
  attachTitlebarToWindow(mainWindow);
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
    },
    {
      label: 'Developer',
      submenu: [
        { role: 'toggleDevTools' }
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
  getUserData();
  createWindow();
  setMenu();
});

// app.on('window-all-closed', function () { app.exit() });

//No more remote....

/// This should be part of potopea.js api files as thats whats expecting it.
ipcMain.handle('openDialog', async (event, options) => {
  let response = await dialog.showOpenDialog(options);
  if (!response.canceled) {
    return response.filePaths[0];
  } else {
    console.log("no file selected");
    return;
  };
});

ipcMain.handle('saveDialog', async (event, options) => {
  let response = await dialog.showSaveDialog(options);
  if (!response.canceled) {
    return response.filePath;
  } else {
    console.log("no file selected");
    return;
  };
});

ipcMain.handle('openFile', async (event, options) => {
  let response = await dialog.showOpenDialog(options);
  if (!response.canceled) {
    let file = fs.readFileSync(response.filePaths[0]).buffer;
    return { file: file, path: response.filePaths[0] };
  } else {
    console.log("no file selected");
    return;
  }
});

ipcMain.handle('saveFile', async (event, path, file) => {
  fs.writeFileSync(path, Buffer.from(file));
  return true;
});

ipcMain.handle('getGlobal', async (event, ...theArgs) => {
  if (theArgs.length > 1) {
    let result = theArgs.reduce(function (newObj, key) {
      newObj[key] = globals[key];
      return newObj;
    }, {});
    return result;
  }
  return globals[theArgs[0]];
})

ipcMain.handle('setGlobal', async (event, key, value) => {
  globals[key] = value;
});
///


ipcMain.handle('customTBar', function (event, command) {
  switch (command) {
    // case 'minimize':
    //   BrowserWindow.fromWebContents(event.sender).minimize();
    //   break;
    // case 'maximize':
    //   const window = BrowserWindow.fromWebContents(event.sender);
    //   window.isMaximized() ? window.unmaximize() : window.maximize();
    //   break;
    case 'close':
      var choice = dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), {
        type: "question",
        buttons: ["Yes", "No"],
        title: "Exit?",
        message: "Unsaved work will be lost."
      });
      if (choice == 0) app.exit();
      break;
    // case 'is-maximized':
    //   return BrowserWindow.fromWebContents(event.sender).isMaximized()
    //   break;
    default:
      console.log("Unknown customTBar command", command);
  }
})