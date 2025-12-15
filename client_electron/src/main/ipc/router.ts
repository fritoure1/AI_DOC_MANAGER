import { ipcMain, shell } from 'electron';
import * as authController from '../controllers/auth.controller';
import * as documentController from '../controllers/documents.controller';
import * as historyController from '../controllers/history.controller';
import * as searchController from '../controllers/search.controller';
import * as tagsController from '../controllers/tags.controller';
import * as uploadController from '../controllers/upload.controller';

export function registerRoutes() {
  console.log(' Enregistrement des routes IPC...');

  ipcMain.handle('auth:login', async (_, data) => authController.login(data));
  ipcMain.handle('auth:register', async (_, data) => authController.register(data));

  ipcMain.handle('documents:getAll', async (_, userId) => documentController.getUserDocuments(userId));
  ipcMain.handle('documents:delete', async (_, { id, userId }) => documentController.deleteDocument(id, userId));
  ipcMain.handle('documents:getFile', async (_, { id, userId }) => documentController.getDocumentFile(id, userId));

  ipcMain.handle('upload:file', async (_, { filePath, userId }) => uploadController.upload(filePath, userId));

  ipcMain.handle('search:query', async (_, { q, userId }) => searchController.search(q, userId));

  ipcMain.handle('history:get', async (_, userId) => historyController.getHistory(userId));


  ipcMain.handle('tags:getAll', async (_, userId) => tagsController.getTags(userId));
  ipcMain.handle('tags:create', async (_, data) => tagsController.createTag(data));
  ipcMain.handle('tags:link', async (_, data) => tagsController.linkTag(data));
  
  ipcMain.handle('files:open', async (_, filePath) => {
    console.log("📂 Ouverture demandée pour :", filePath);
    const errorMessage = await shell.openPath(filePath);
    if (errorMessage) {
      throw new Error(`Impossible d'ouvrir le fichier : ${errorMessage}`);
    }
    return true;
  });
  console.log('✅ Routes IPC enregistrées !');
}