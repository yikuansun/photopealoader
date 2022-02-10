const { app, BrowserWindow, nativeTheme, Menu, shell } = require('electron');
const fs = require('fs');
const admZip = require('adm-zip');
const ipcMain = require('electron').ipcMain;
const isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == 'true') : false;

let globals = {};

app.on('open-file', function (event, filePath) {
  globals.openedFile = fs.readFileSync(filePath).buffer;
});

function getUserData() {
  var zip = new admZip();
  zip.addLocalFolder(__dirname + '/defaultfs');
  zip.extractAllTo(app.getPath('documents') + '/Photopea files', false);

  var jsonconfig = fs.readFileSync(`${app.getPath('documents')}/Photopea files/config.json`, 'utf-8');
  globals.options = JSON.parse(jsonconfig);

  globals.resources = [];
  for (var resource of fs.readdirSync(`${app.getPath('documents')}/Photopea files/Resources`)) {
    var fileext = resource.split('.').pop();
    if (!(['md', 'DS_Store'].includes(fileext))) globals.resources.push(fs.readFileSync(`${app.getPath('documents')}/Photopea files/Resources/${resource}`).buffer);
  }

  globals.plugins = [];
  for (var file of fs.readdirSync(`${app.getPath('documents')}/Photopea files/Plugins`)) {
    var fileext = file.split('.').pop();
    if (fileext.toLowerCase() == "json") {
      globals.plugins.push(JSON.parse(fs.readFileSync(`${app.getPath('documents')}/Photopea files/Plugins/${file}`, 'utf-8')));
    }
  }

  if (process.argv.length >= 2) {
    var filePath = process.argv[isDev ? 2 : 1];
    fs.readFile(filePath, null, function (err, data) {
      if (err) console.log(err);
      if (data) globals.openedFile = data.buffer;
    });
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    titleBarStyle: "hidden",
    frame: process.platform == "darwin",
    webPreferences: {
      //   nodeIntegration: true,
      // contextIsolation: false,
      // enableRemoteModule: true,
      preload: `${__dirname}/preload.js`,
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('window/index.html');
  mainWindow.maximize();
  mainWindow.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
  nativeTheme.themeSource = 'dark';

  isDev && mainWindow.webContents.openDevTools();
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

app.on('window-all-closed', function () { app.quit() });


//No more remote....

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
  globals[key]=value;
})

ipcMain.handle('customTBar', function (event, command) {
  switch (command) {
    case 'minimize':
      BrowserWindow.fromWebContents(event.sender).minimize();
      break;
    case 'maximize':
      const window = BrowserWindow.fromWebContents(event.sender);
      window.isMaximized() ? window.unmaximize() : window.maximize();
      break;
    case 'close':
      BrowserWindow.fromWebContents(event.sender).close();
      break;
    case 'is-maximized':
      return BrowserWindow.fromWebContents(event.sender).isMaximized()
      break;
    default:
      console.log("Unknown customTBar command", command);
  }
})