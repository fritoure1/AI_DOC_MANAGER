"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  files: {
    getPath: (file) => electron.webUtils.getPathForFile(file),
    open: (filePath) => electron.ipcRenderer.invoke("files:open", filePath)
  },
  auth: {
    login: (data) => electron.ipcRenderer.invoke("auth:login", data),
    register: (data) => electron.ipcRenderer.invoke("auth:register", data)
  },
  documents: {
    getAll: (userId) => electron.ipcRenderer.invoke("documents:getAll", userId),
    delete: (id, userId) => electron.ipcRenderer.invoke("documents:delete", { id, userId }),
    getFile: (id, userId) => electron.ipcRenderer.invoke("documents:getFile", { id, userId })
  },
  upload: {
    uploadFile: (filePath, userId) => electron.ipcRenderer.invoke("upload:file", { filePath, userId })
  },
  search: {
    query: (q, userId) => electron.ipcRenderer.invoke("search:query", { q, userId })
  },
  history: {
    get: (userId) => electron.ipcRenderer.invoke("history:get", userId)
  },
  tags: {
    getAll: (userId) => electron.ipcRenderer.invoke("tags:getAll", userId),
    create: (data) => electron.ipcRenderer.invoke("tags:create", data),
    link: (data) => electron.ipcRenderer.invoke("tags:link", data)
  }
});
