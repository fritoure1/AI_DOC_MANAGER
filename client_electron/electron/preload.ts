import { ipcRenderer, contextBridge, webUtils } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  files: {
    getPath: (file: File) => webUtils.getPathForFile(file),
    open: (filePath: string) => ipcRenderer.invoke('files:open', filePath)
  },
  auth: {
    login: (data: any) => ipcRenderer.invoke('auth:login', data),
    register: (data: any) => ipcRenderer.invoke('auth:register', data),
  },
  documents: {
    getAll: (userId: number) => ipcRenderer.invoke('documents:getAll', userId),
    delete: (id: number, userId: number) => ipcRenderer.invoke('documents:delete', { id, userId }),
    getFile: (id: number, userId: number) => ipcRenderer.invoke('documents:getFile', { id, userId }),
  },
  upload: {
    uploadFile: (filePath: string, userId: number) => ipcRenderer.invoke('upload:file', { filePath, userId }),
  },
  search: {
    query: (q: string, userId: number) => ipcRenderer.invoke('search:query', { q, userId }),
  },
  history: {
    get: (userId: number) => ipcRenderer.invoke('history:get', userId),
  },
  tags: {
    getAll: (userId: number) => ipcRenderer.invoke('tags:getAll', userId),
    create: (data: any) => ipcRenderer.invoke('tags:create', data),
    link: (data: any) => ipcRenderer.invoke('tags:link', data),
  }
})