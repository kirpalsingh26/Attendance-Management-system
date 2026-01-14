const axios = require('axios');
require('dotenv').config();

const testOCR = async () => {
  try {
    console.log('Testing OCR.space API...');
    console.log('API Key:', process.env.OCR_API_KEY);
    
    // Use a simple test image (1x1 red pixel PNG)
    const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('base64Image', `data:image/png;base64,${testBase64}`);
    formData.append('language', 'eng');
    
    console.log('Sending test request to OCR.space...');
    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: {
        ...formData.getHeaders(),
        'apikey': process.env.OCR_API_KEY
      },
      timeout: 15000
    });
    
    console.log('✅ OCR API Response:');
    console.log('Status:', response.data.OCRExitCode);
    console.log('Is Error:', response.data.IsErroredOnProcessing);
    
    if (response.data.IsErroredOnProcessing) {
      console.log('❌ Error:', response.data.ErrorMessage);
    } else {
      console.log('✅ Success! OCR API is working correctly.');
      console.log('Parsed text:', response.data.ParsedResults?.[0]?.ParsedText || '(empty)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

testOCR();
