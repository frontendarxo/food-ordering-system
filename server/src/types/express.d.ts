import type { Multer } from 'multer';

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
    }
    
    namespace Locals {
      interface Locals {
        userId?: string;
        userRole?: 'admin' | 'worker';
        userLocation?: 'шатой' | 'гикало';
      }
    }
  }
}

export {};

