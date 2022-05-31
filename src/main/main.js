import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog , Menu} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Database from 'better-sqlite3';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import webpackPaths from '../../.erb/configs/webpack.paths';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow;
let printToPDFWindow;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

// Connect to db
const db = new Database('MyDB' , { verbose: console.log } );

// Read run-time assets
const sql = isDevelopment
  ? path.join(webpackPaths.appPath, 'sql')
  : path.join(__dirname, '../../sql'); // In prod, __dirname is release/app/dist/main. We want release/app/sql
const create = fs.readFileSync(path.join(sql, 'create.sql')).toString().trim();
const insert = fs.readFileSync(path.join(sql, 'insert.sql')).toString().trim();


// Prepare the query
db.exec(create);
const insertStmt = db.prepare(insert);

// Insert items
const insertMany = db.transaction((cats) => {
  for (const cat of cats) insertStmt.run(cat);
});
insertMany([
  { name: 'Joey', age: 2 },
  { name: 'Sally', age: 4 },
  { name: 'Junior', age: 1 },
]);

//DB testing
//DELETE
 let sqlDelete = `DELETE FROM cats WHERE name='Joey'`;
let StmtDelete = db.prepare(sqlDelete);
const deleteEntry = db.transaction(()=>{
  StmtDelete.run();

})
//deleteEntry();

//Get All
let sqlgetAll = 'SELECT * FROM cats';
const data = db.prepare(sqlgetAll).all();
/* for (let i=0;i<rows.length;i++){
  console.log(rows[i].name, rows[i].age);
} */
//console.log(data)

//Get one
let sqlGetOne = `SELECT * FROM cats WHERE name='Joey'`;
const rs = db.prepare(sqlGetOne).all();
console.log(rs)

//UPDATE
let sqlUpdate = `UPDATE cats SET age='1' WHERE name='Joey'`;
let StmtUpdate = db.prepare(sqlUpdate);
const UpdateEntry = db.transaction(()=>{
  StmtUpdate.run();

})
UpdateEntry();
//DB testing




if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths) => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // @ts-ignore
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      const ctxMenu = Menu.buildFromTemplate(ctxTemplate);
      mainWindow.webContents.on('context-menu', (event, params) => {
        ctxMenu.popup(mainWindow);
      })
    }
  });


  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();


};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.on('choose',()=>{
  dialog.showMessageBox({
    title: 'are you sure about that',
    detail: 'hmmm think',
    message:'ti think again',
    type:'warning',
    buttons:['yes','no','cancel']
  },(response)=>{
    console.log(response)
  })
})


ipcMain.on('print-pdf',event =>{
  printToPDFWindow = BrowserWindow.fromId(BrowserWindow.getFocusedWindow().webContents.id);

  printToPDFWindow.webContents.printToPDF({}, () => {

   }).then((data,error) => {
    if (error) {
      console.log(error)
      return;
    }

    if (data) {
      const desktop = app.getPath('desktop');
      const filePath = `${desktop}/${printToPDFWindow.getTitle()}-captured.pdf`;
      fs.writeFileSync(filePath, data);
    }
  })
})
//custom menu
const ctxTemplate = [
  {
    label: 'Copy',
    accelerator: 'CTRL + C',
    role: 'copy'
  },
  {
    label: 'Cut',
    accelerator: 'CTRL + X',
    role: 'cut'
  },
  {
    label: 'Paste',
    accelerator: 'CTRL + V',
    role: 'paste'
  },
  {
    type: 'separator'
  },
  {
    label: 'Select All',
    accelerator: 'CTRL + A',
    role: 'selectall'
  }
]

