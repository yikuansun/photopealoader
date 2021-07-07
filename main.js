const { app, BrowserWindow, nativeTheme, Menu, shell } = require('electron');
const fs = require('fs');
const admZip = require('adm-zip');

app.on('open-file', function(event, filePath) {
  global.openedFile = fs.readFileSync(filePath).buffer;
});

function getUserData() {
  var zip = new admZip();
  zip.addLocalFolder(__dirname + '/defaultfs');
  zip.extractAllTo(app.getPath('documents') + '/Photopea files', false);

  var jsonconfig = fs.readFileSync(`${app.getPath('documents')}/Photopea files/config.json`, 'utf-8');
  global.options = JSON.parse(jsonconfig);

  global.resources = [];
  for (var resource of fs.readdirSync(`${app.getPath('documents')}/Photopea files/Resources`)) {
    var fileext = resource.split('.').pop();
    if (!(['md', 'DS_Store'].includes(fileext))) global.resources.push(fs.readFileSync(`${app.getPath('documents')}/Photopea files/Resources/${resource}`).buffer);
  }

  global.plugins = [];
  for (var file of fs.readdirSync(`${app.getPath('documents')}/Photopea files/Plugins`)) {
    var fileext = file.split('.').pop();
    if (fileext.toLowerCase() == "json") {
      global.plugins.push(JSON.parse(fs.readFileSync(`${app.getPath('documents')}/Photopea files/Plugins/${file}`, 'utf-8')));
    }
  }

  if (process.argv.length > 2) {
    var filePath = process.argv[1];
    global.openedFile = fs.readFileSync(filePath).buffer;
  }
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');
  mainWindow.maximize();
  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
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
