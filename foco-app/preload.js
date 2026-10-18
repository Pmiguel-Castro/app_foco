const { contextBridge, ipcRenderer } = require('electron');

// Superficie minima exposta ao renderer (contextIsolation continua ligado).
contextBridge.exposeInMainWorld('foco', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  onMaximizeChanged: (callback) => {
    ipcRenderer.on('maximize-changed', (_event, value) => callback(value));
  },
  toggleOverlay: () => ipcRenderer.invoke('window:toggle-overlay'),
  getOverlay: () => ipcRenderer.invoke('window:get-overlay'),
  onOverlayChanged: (callback) => {
    ipcRenderer.on('overlay-changed', (_event, value) => callback(value));
  }
});
