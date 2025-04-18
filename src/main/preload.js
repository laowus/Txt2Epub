// preload.js

const { contextBridge, ipcRenderer } = require('electron')
const { isMacOS, isWinOS, useCustomTrafficLight } = require('./env')

contextBridge.exposeInMainWorld('electronAPI', {
  //ipcRenderer,
  ipcRenderer: {
    ...ipcRenderer,
    on: ipcRenderer.on.bind(ipcRenderer),
  },
  isMacOS,
  isWinOS,
  useCustomTrafficLight
})
