import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const convertSvgToPng = async (inputFile, outputFile, size) => {
  try {
    const svg = fs.readFileSync(inputFile, 'utf8');
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputFile);
    console.log(`Converted ${inputFile} to ${outputFile}`);
  } catch (error) {
    console.error(`Error converting ${inputFile}:`, error);
  }
};

const main = async () => {
  const publicDir = path.join(__dirname, 'client', 'public');
  
  await convertSvgToPng(
    path.join(publicDir, 'icon-192.svg'),
    path.join(publicDir, 'icon-192.png'),
    192
  );
  
  await convertSvgToPng(
    path.join(publicDir, 'icon-512.svg'),
    path.join(publicDir, 'icon-512.png'),
    512
  );
};

main().catch(console.error);