import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function resizeIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  const baseIconPath = path.join(iconsDir, 'icon-base.png');
  
  if (!fs.existsSync(baseIconPath)) {
    console.error('Base icon not found:', baseIconPath);
    process.exit(1);
  }
  
  console.log('Resizing icons...');
  
  for (const size of ICON_SIZES) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    await sharp(baseIconPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Created: icon-${size}x${size}.png`);
  }
  
  console.log('All icons resized successfully!');
}

resizeIcons().catch(console.error);
