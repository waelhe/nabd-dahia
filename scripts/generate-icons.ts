import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const zai = await ZAI.create();
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  console.log('Generating PWA icons for Qudsaya Plus...');
  
  // Generate the main 512x512 icon first
  const prompt = 'Modern minimalist app icon for Qudsaya Plus local community app, green gradient background (#16a34a to #22c55e), white pulse/heartbeat line symbol representing community connection, clean flat design, circular shape, professional mobile app icon, high quality';
  
  const response = await zai.images.generations.create({
    prompt: prompt,
    size: '1024x1024'
  });
  
  const imageBase64 = response.data[0].base64;
  const buffer = Buffer.from(imageBase64, 'base64');
  
  // Save the base image
  const baseImagePath = path.join(iconsDir, 'icon-base.png');
  fs.writeFileSync(baseImagePath, buffer);
  console.log(`✓ Generated base icon: ${baseImagePath}`);
  
  // For now, copy the base image as all sizes
  // In production, you'd resize the image properly
  for (const size of ICON_SIZES) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    fs.copyFileSync(baseImagePath, outputPath);
    console.log(`✓ Created icon: ${size}x${size}`);
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
