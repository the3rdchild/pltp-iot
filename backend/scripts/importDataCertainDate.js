// test-single-tag.js
require('dotenv').config({ path: '/www/wwwroot/frontend/backend/.env' });
const https = require('https');

async function testSingleTag() {
  const url = new URL(process.env.HONEYWELL_API_URL);
  
  // EXACT SAME as Talend screenshot
  const requestBody = {
    SampleInterval: 60000,
    ResampleMethod: "Around",
    MinimumConfidence: 100,
    MaxRows: 8641,  // ← Same as Talend
    TimeFormat: 1,
    ReductionData: "now",
    TagName: "5LBB31FP002PVI.PV",
    StartTime: "01-OCT-2025 14:07:00.000",
    EndTime: "02-OCT-2025 14:07:00.000",
    OutputTimeFormat: 1
  };

  console.log('📤 Testing API with parameters:');
  console.log(JSON.stringify(requestBody, null, 2));
  console.log('');

  const postData = JSON.stringify(requestBody);

  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.HONEYWELL_API_X_API_KEY,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('📥 API Response:');
          console.log('   Status:', jsonData.status);
          console.log('   Message:', jsonData.message);
          
          if (jsonData.data && jsonData.data[0]) {
            const count = jsonData.data[0].TimeStamp?.length || 0;
            console.log('   Records:', count);
            console.log('   Expected:', 1441);
            console.log('   Match:', count === 1441 ? '✅ YES' : '❌ NO');
            
            if (count > 0) {
              console.log('   First:', jsonData.data[0].TimeStamp[0]);
              console.log('   Last:', jsonData.data[0].TimeStamp[count - 1]);
            }
          }
          
          // Save full response to file for inspection
          const fs = require('fs');
          fs.writeFileSync('api-test-response.json', JSON.stringify(jsonData, null, 2));
          console.log('\n💾 Full response saved to: api-test-response.json');
          
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

testSingleTag()
  .then(() => console.log('\n✅ Test complete'))
  .catch(err => console.error('\n❌ Test failed:', err));