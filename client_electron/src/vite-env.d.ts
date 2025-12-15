/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    files: {
      getPath: (file: File) => string;
      open: (path: string) => Promise<boolean>;
    };
    auth: {
      login: (data: any) => Promise<any>;
      register: (data: any) => Promise<any>;
    };
    documents: {
      getAll: (userId: number) => Promise<any>;
      delete: (id: number, userId: number) => Promise<any>;
      getFile: (id: number, userId: number) => Promise<string>;
    };
    upload: {
      uploadFile: (filePath: string, userId: number) => Promise<any>;
    };
    search: {
      query: (q: string, userId: number) => Promise<any>;
    };
    history: {
      get: (userId: number) => Promise<any>;
    };
    tags: {
      getAll: (userId: number) => Promise<any>;
      create: (data: any) => Promise<any>;
      link: (data: any) => Promise<any>;
    };
  }
}