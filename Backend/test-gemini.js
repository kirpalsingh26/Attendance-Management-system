const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const testGemini = async () => {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key:', process.env.GEMINI_API_KEY);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    console.log('Sending test request...');
    const result = await model.generateContent(['Say "Hello, the API is working!"']);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success!');
    console.log('Response:', text);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
};

testGemini();
