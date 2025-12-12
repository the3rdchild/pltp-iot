require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const axios = require('axios');
const fs = require('fs');
const { Parser } = require('json2csv');

// Load from .env and parse the mapping
const tagNameMapping = JSON.parse(process.env.HONEYWELL_TAGNAME_MAPPING || '{}');
// Extract the tag names (the keys) from the mapping
const tagNames = Object.keys(tagNameMapping);

const fetchData = async (tagName, startTime, endTime) => {
  try {
    const response = await axios.post(
      process.env.HONEYWELL_API_URL,
      {
        SampleInterval: process.env.HONEYWELL_API_SAMPLE_INTERVAL || 60000,
        ResampleMethod: 'Average',
        MinimumConfidence: 100,
        MaxRows: 1000000, // A large number to get all data in the range
        TimeFormat: 1,
        ReductionData: 'avg',
        TagName: tagName,
        StartTime: startTime,
        EndTime: endTime,
        OutputTimeFormat: 1
      },
      {
        headers: JSON.parse(process.env.HONEYWELL_API_HEADERS),
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching data for ${tagName}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return null;
  }
};

const main = async () => {
  if (!process.env.HONEYWELL_API_URL || !process.env.HONEYWELL_TAGNAME_MAPPING || !process.env.HONEYWELL_API_HEADERS) {
    console.error('One or more required Honeywell environment variables are not set in .env file.');
    console.error('Please define HONEYWELL_API_URL, HONEYWELL_TAGNAME_MAPPING, and HONEYWELL_API_HEADERS.');
    return;
  }
  
  if (tagNames.length === 0) {
    console.error('No tag names found in HONEYWELL_TAGNAME_MAPPING. Please check your .env file.');
    return;
  }

  const startTime = '13-MAY-2025 14:04:32.000';
  // Use a more realistic end time for fetching, e.g., now.
  const endTime = new Date().toISOString();
  const allData = [];

  for (const tagName of tagNames) {
    console.log(`Fetching data for ${tagName}...`);
    const data = await fetchData(tagName, startTime, endTime);
    if (data && data.length > 0 && data[0].TimeStamp) {
      for (let i = 0; i < data[0].TimeStamp.length; i++) {
        const record = {
          timestamp: data[0].TimeStamp[i],
          tag_name: data[0].TagName,
          // Map to the more descriptive name from our mapping
          description: tagNameMapping[data[0].TagName] || 'N/A',
          value: data[0].Value[i]
        };
        allData.push(record);
      }
    }
  }

  if (allData.length > 0) {
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(allData);
    fs.writeFileSync('historical_data.csv', csv);
    console.log(`Historical data saved to historical_data.csv`);
  } else {
    console.log('No data fetched from the API.');
  }
};

main();
