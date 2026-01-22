var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
const DEFAULT_OPTIONS = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 85,
};
export const optimizeImage = (filePath_1, ...args_1) => __awaiter(void 0, [filePath_1, ...args_1], void 0, function* (filePath, options = {}) {
    try {
        const { maxWidth, maxHeight, quality } = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
        const ext = path.extname(filePath).toLowerCase();
        const tempPath = filePath.replace(ext, `-temp${ext}`);
        const image = sharp(filePath);
        const metadata = yield image.metadata();
        if (!metadata.width || !metadata.height) {
            console.warn('Не удалось получить размеры изображения');
            return;
        }
        let pipeline = image.resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
        });
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                pipeline = pipeline.jpeg({ quality, mozjpeg: true });
                break;
            case '.png':
                pipeline = pipeline.png({ quality, compressionLevel: 9 });
                break;
            case '.webp':
                pipeline = pipeline.webp({ quality });
                break;
            case '.gif':
                break;
            default:
                pipeline = pipeline.jpeg({ quality });
        }
        yield pipeline.toFile(tempPath);
        const originalSize = fs.statSync(filePath).size;
        const optimizedSize = fs.statSync(tempPath).size;
        if (optimizedSize < originalSize) {
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);
            console.log(`✅ Изображение оптимизировано: ${(originalSize / 1024).toFixed(1)} KB → ${(optimizedSize / 1024).toFixed(1)} KB (экономия ${(((originalSize - optimizedSize) / originalSize) * 100).toFixed(1)}%)`);
        }
        else {
            fs.unlinkSync(tempPath);
            console.log('ℹ️  Оригинал уже оптимален, изменения не применены');
        }
    }
    catch (error) {
        console.error('❌ Ошибка оптимизации изображения:', error);
        throw error;
    }
});
