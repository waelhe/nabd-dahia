import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const outputDir = '/home/z/my-project/public/images/categories';

// Define category prompts
const categories = [
  {
    id: 'restaurants',
    prompt: 'Arabic restaurant interior, traditional Syrian cuisine, warm lighting, elegant tables with delicious mezze plates, professional food photography, high quality, detailed',
  },
  {
    id: 'cafes',
    prompt: 'Cozy Arabic cafe, traditional coffee cups, shisha, comfortable seating, warm ambient lighting, people socializing, professional photography, high quality',
  },
  {
    id: 'hotels',
    prompt: 'Luxury Middle Eastern hotel lobby, elegant architecture, marble floors, modern Arabic design, welcoming entrance, professional photography, high quality',
  },
  {
    id: 'doctor',
    prompt: 'Professional doctor in modern clinic, stethoscope, medical equipment, clean white environment, friendly demeanor, healthcare setting, professional photography, high quality',
  },
  {
    id: 'pharmacy',
    prompt: 'Modern pharmacy interior, shelves with medicine, pharmacist in white coat, clean and organized, professional healthcare setting, bright lighting, high quality',
  },
  {
    id: 'beauty',
    prompt: 'Elegant beauty salon, hair styling, makeup station, soft pink lighting, modern equipment, professional beauty treatment, high quality photography',
  },
  {
    id: 'services',
    prompt: 'Skilled craftsman at work, tools, workshop, professional service, hands working on detailed task, warm lighting, high quality photography',
  },
  {
    id: 'cars',
    prompt: 'Modern car service center, mechanic working on car, professional tools, clean workshop, automotive service, bright lighting, high quality',
  },
  {
    id: 'gas',
    prompt: 'Modern gas station, fuel pumps, clean facility, bright lighting, convenient location, professional photography, high quality',
  },
  {
    id: 'markets',
    prompt: 'Middle Eastern supermarket, fresh produce, colorful fruits and vegetables, clean aisles, shopping carts, bright lighting, professional photography',
  },
  {
    id: 'shops',
    prompt: 'Modern retail shop interior, fashion items on display, clean layout, shopping experience, bright lighting, professional photography, high quality',
  },
  {
    id: 'tourism',
    prompt: 'Syrian tourist destination, historic architecture, beautiful landscape, ancient ruins, clear blue sky, professional travel photography, high quality',
  },
  {
    id: 'professionals',
    prompt: 'Professional office workspace, lawyer or accountant desk, law books, modern office, business setting, professional photography, high quality',
  },
];

async function generateImages() {
  console.log('Starting image generation...');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const zai = await ZAI.create();
  
  for (const category of categories) {
    const outputPath = path.join(outputDir, `${category.id}.jpg`);
    
    // Skip if file already exists and is recent
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      const fileAge = Date.now() - stats.mtimeMs;
      // Skip if file is less than 1 day old
      if (fileAge < 24 * 60 * 60 * 1000) {
        console.log(`Skipping ${category.id} - file already exists`);
        continue;
      }
    }
    
    try {
      console.log(`Generating image for ${category.id}...`);
      
      const response = await zai.images.generations.create({
        prompt: category.prompt,
        size: '1024x1024',
      });
      
      const imageBase64 = response.data[0].base64;
      const buffer = Buffer.from(imageBase64, 'base64');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✓ Generated: ${outputPath} (${buffer.length} bytes)`);
    } catch (error) {
      console.error(`✗ Failed to generate ${category.id}:`, error);
    }
  }
  
  console.log('Image generation complete!');
}

generateImages().catch(console.error);
