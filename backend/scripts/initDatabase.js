const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database initialization...');
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, '../models/init.sql');
    let sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Seed password comes from the environment, never from this file.
    // It used to be a string literal right here, which put a live admin
    // credential into the repository and into git history where it stays
    // readable forever. Anything hardcoded here is public.
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!password) {
      throw new Error(
        'SEED_ADMIN_PASSWORD is not set.\n' +
        '  Run with:  SEED_ADMIN_PASSWORD=\'<password>\' node scripts/initDatabase.js\n' +
        '  (leading space keeps it out of shell history in bash/zsh)'
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Password hash generated');
    
    // Replace placeholder with actual hash
    sql = sql.replace('$2a$10$placeholder', passwordHash);
    
    // Execute SQL
    await client.query(sql);
    console.log('✅ Database schema created successfully');
    
    // Verify user creation
    const result = await client.query(
      'SELECT email, name, role FROM users WHERE email = $1',
      ['pertasmart@unpad.ac.id']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Default admin user created:', result.rows[0]);
    }
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Seeded account: pertasmart@unpad.ac.id');
    console.log('   Password: the SEED_ADMIN_PASSWORD you supplied (not echoed here)');
    console.log('\n   Use scripts/manage-user.js to add or change accounts afterwards.');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
