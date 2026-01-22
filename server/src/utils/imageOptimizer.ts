import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: OptimizeOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 85,
};

export const optimizeImage = async (
  filePath: string,
  options: OptimizeOptions = {}
): Promise<void> => {
  try {
    const { maxWidth, maxHeight, quality } = { ...DEFAULT_OPTIONS, ...options };

    const ext = path.extname(filePath).toLowerCase();
    const tempPath = filePath.replace(ext, `-temp${ext}`);

    const image = sharp(filePath);
    const metadata = await image.metadata();

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

    await pipeline.toFile(tempPath);

    const originalSize = fs.statSync(filePath).size;
    const optimizedSize = fs.statSync(tempPath).size;

    if (optimizedSize < originalSize) {
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
      console.log(
        `✅ Изображение оптимизировано: ${(originalSize / 1024).toFixed(1)} KB → ${(optimizedSize / 1024).toFixed(1)} KB (экономия ${(((originalSize - optimizedSize) / originalSize) * 100).toFixed(1)}%)`
      );
    } else {
      fs.unlinkSync(tempPath);
      console.log('ℹ️  Оригинал уже оптимален, изменения не применены');
    }
  } catch (error) {
    console.error('❌ Ошибка оптимизации изображения:', error);
    throw error;
  }
};
