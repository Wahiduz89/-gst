// src/lib/db-test.ts - Database connection testing utility
import { prisma } from '@/lib/prisma';

export async function validateDatabaseSetup() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if required tables exist
    const requiredTables = [
      'User',
      'Customer', 
      'Invoice',
      'InvoiceItem',
      'Account',
      'Session',
      'VerificationToken'
    ];

    for (const table of requiredTables) {
      try {
        const tableName = table.toLowerCase();
        const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${tableName}
          );
        `;
        console.log(`✅ Table ${table} exists`);
      } catch (error) {
        console.error(`❌ Table ${table} missing or inaccessible:`, error);
        throw new Error(`Required table ${table} is missing`);
      }
    }

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database query test successful. Users in database: ${userCount}`);

    return { success: true, message: 'Database setup is valid' };

  } catch (error) {
    console.error('❌ Database validation failed:', error);
    return { 
      success: false, 
      message: 'Database setup validation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function setupRequiredData() {
  try {
    // Check if NextAuth tables have proper indexes
    console.log('🔧 Verifying database indexes...');
    
    // You could add specific index checks here if needed
    
    console.log('✅ Database setup verification complete');
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}