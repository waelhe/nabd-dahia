import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Check if listing model exists
    const models = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
    
    return NextResponse.json({
      status: 'ok',
      connection: result,
      availableModels: models,
      hasListing: 'listing' in prisma,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
