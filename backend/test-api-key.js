#!/usr/bin/env node
/**
 * Test API Key Authentication
 * Usage: node test-api-key.js
 */

require('dotenv').config();

console.log('='.repeat(60));
console.log('API KEY CONFIGURATION TEST');
console.log('='.repeat(60));

console.log('\n📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');

console.log('\n🔑 API Keys Status:');
console.log('HONEYWELL_API_KEY:', process.env.HONEYWELL_API_KEY ? '✅ SET (' + process.env.HONEYWELL_API_KEY.substring(0, 20) + '...)' : '❌ NOT SET');
console.log('EDGE_PC_API_KEY:', process.env.EDGE_PC_API_KEY ? '✅ SET (' + process.env.EDGE_PC_API_KEY.substring(0, 20) + '...)' : '❌ NOT SET');
console.log('TEST_API_KEY:', process.env.TEST_API_KEY ? '✅ SET (' + process.env.TEST_API_KEY.substring(0, 20) + '...)' : '❌ NOT SET');

console.log('\n🌐 IP Whitelist:');
console.log('WHITELISTED_IPS:', process.env.WHITELISTED_IPS || '❌ NOT SET');

console.log('\n' + '='.repeat(60));

// Test the middleware
const { getValidApiKeys } = require('./middleware/apiKeyAuth');
const validKeys = getValidApiKeys();

console.log('\n📊 Valid API Keys Count:', validKeys.length);

if (validKeys.length === 0) {
  console.log('❌ ERROR: No API keys configured!');
  console.log('💡 TIP: Add API keys to your .env file');
  process.exit(1);
} else {
  console.log('✅ SUCCESS: API keys are configured');
  validKeys.forEach((key, index) => {
    console.log(`   ${index + 1}. ${key.substring(0, 20)}...`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('✅ Configuration test completed!');
console.log('='.repeat(60));
