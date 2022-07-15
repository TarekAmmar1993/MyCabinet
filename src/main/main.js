import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog , Menu} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Database from 'better-sqlite3';
import { resolveHtmlPath } from './util';
import webpackPaths from '../../.erb/configs/webpack.paths';
import url from "url";

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow;
let printToPDFWindow;
let addPatientWindow;

const mainMenuTemplate = [
  // Each object is a dropdown
  {
    label: 'File',
    submenu: [

      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'CTRL+Q',
        click() {
          app.quit();
        }

      }
    ]

  },
  {
    label: 'Edit',
    submenu: [
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
  },
  {
    label: 'Developer Tools',
    submenu: [
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  }
];



if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

 // Connect to db
const db = new Database('MyDB');
// Read run-time assets
const sql = isDevelopment
  ? path.join(webpackPaths.appPath, 'sql')
  : path.join(__dirname, '../../sql'); // In prod, __dirname is release/app/dist/main. We want release/app/sql

const create = fs.readFileSync(path.join(sql, 'create.sql')).toString().trim();



// Prepare the query
db.exec(create);

/* if (isDevelopment) {
  require('electron-debug')();
} */

function getRecordByID(id){
  let sqlGetOne = `SELECT * FROM patients WHERE uniqueID='${id}'`;
  const record = db.prepare(sqlGetOne).all();

  mainWindow.webContents.send('sendRecordToFocus',record)
}
function reload(){
  mainWindow.webContents.reload();
}

function getAll(){
  let sqlgetAll = 'SELECT * FROM patients';
  const data = db.prepare(sqlgetAll).all();
  mainWindow.webContents.send('responseAllRecords',data)
}

function deleteRecord(event,args) {
  let sqlDelete = `DELETE FROM patients WHERE UniqueID='${args[0]}'`;
  console.log(sqlDelete)
  let StmtDelete = db.prepare(sqlDelete);
  const deleteEntry = db.transaction(()=>{
    StmtDelete.run();
  })
  deleteEntry();
  reload();
}

function newPatientWindow() {
  // Create new window
  addPatientWindow = new BrowserWindow({
    width: 1024,
    height: 850,
    title: 'Add New Patient',
     webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }

  });

   addPatientWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../renderer/addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
 ;





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
      mainWindow.show();
      const ctxMenu = Menu.buildFromTemplate(ctxTemplate);
      mainWindow.webContents.on('context-menu', (event, params) => {
        ctxMenu.popup(mainWindow);
      })
  });


  mainWindow.on('closed', () => {
    app.quit();
  });



  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
// Insert menu
  Menu.setApplicationMenu(mainMenu);

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

app.whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.on('openRecord',(event,args)=>{
  let ID = args[0]
  getRecordByID(ID);
})

ipcMain.on('deleteRecord',(event,args)=> {
  dialog.showMessageBox(null, {
      title: 'Are you sure? ',
      detail: "First : " + args[1] + ", Last : " + args[2] + ", Birth Date : " + args[3],
      message: 'Deleting the record:',
      type: 'warning',
      buttons: ['yes', 'no']
    },
  ).then(function(r) {
    if (r.response === 0) {
      deleteRecord(event,args)
    }
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

ipcMain.on('reload',reload);

ipcMain.on('newPatient',()=>{
  newPatientWindow();
})

ipcMain.on('requestAllRecords',getAll);

ipcMain.on('insertNewPatient',(event,patient)=>{
  let sqlQuery= `INSERT ` +`INTO patients (uniqueID, firstName, lastName, birthDate,phone,medicalRecord,clinicalRecord) VALUES (@uniqueID,@firstName, @lastName, @birthDate,@phone,@medicalRecord,@clinicalRecord)`
  const insertStmt = db.prepare(sqlQuery);

// Insert items
  const insertPatient = db.transaction((patient) => {
     insertStmt.run(patient);
  });
  insertPatient(
    {uniqueID:patient.uniqueID,
      firstName:patient.firstName,
      lastName:patient.lastName,
      birthDate:patient.birthDate,
      phone:patient.phone,
      medicalRecord:patient.medicalRecord,
      clinicalRecord:patient.clinicalRecord
    },
  );
  reload();
  addPatientWindow.close();


});

ipcMain.on('updateRecord',(event,args)=>{

  //UPDATE
   let sqlUpdate = `UPDATE patients `+
    `SET firstName='${args.firstName}',
    lastName='${args.lastName}',
    birthDate='${args.birthDate}',
    phone='${args.phone}',
    medicalRecord='${args.medicalRecord}',
    clinicalRecord='${args.clinicalRecord}'`
     +
    ` WHERE UniqueID='${args.uniqueID}'`;
   let StmtUpdate = db.prepare(sqlUpdate);
  const UpdateEntry = db.transaction(()=>{
    StmtUpdate.run();


  })
  UpdateEntry();
  reload();

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



