const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on(channel, func) {
      const validChannels = ['responseAllRecords','sendRecordToFocus'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    myTest() {
      ipcRenderer.send('choose', 'info');
    },
    printPDF(){
      ipcRenderer.send('print-pdf');
    },
    requestAllRecords(){
      ipcRenderer.send('requestAllRecords');
    },
    deleteRecord(args){
      ipcRenderer.send('deleteRecord',args);
    },
    reload(){
      ipcRenderer.send('reload');
    },
    openAddPatientWindow(){
      ipcRenderer.send('newPatient');
    },
    insertNewPatient(args){
      ipcRenderer.send('insertNewPatient',args)
    },
    openRecord(args){
      ipcRenderer.send('openRecord',args)
    },
    updateRecord(args){
      ipcRenderer.send('updateRecord',args);
    }

  },
});
