import sharp from 'sharp';
import path from 'path';

const SHORTCUTS = ['marketplace-96', 'real-estate-96', 'directory-96'];

async function resizeShortcuts() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  
  console.log('Resizing shortcut icons...');
  
  for (const name of SHORTCUTS) {
    const inputPath = path.join(iconsDir, `${name}.png`);
    const outputPath = path.join(iconsDir, `${name}-resized.png`);
    
    try {
      await sharp(inputPath)
        .resize(96, 96)
        .png()
        .toFile(outputPath);
      
      // Replace original with resized
      const fs = await import('fs');
      fs.renameSync(outputPath, inputPath);
      
      console.log(`✓ Resized: ${name}.png`);
    } catch (error) {
      console.error(`Failed to resize ${name}:`, error);
    }
  }
  
  console.log('All shortcut icons resized!');
}

resizeShortcuts().catch(console.error);
