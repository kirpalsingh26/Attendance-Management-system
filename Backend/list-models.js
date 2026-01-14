const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const listModels = async () => {
  try {
    console.log('Listing available Gemini models...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try common model names
    const modelsToTry = [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-2.0-flash-exp'
    ];
    
    console.log('\nTesting models:');
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(['test']);
        console.log(`✅ ${modelName} - WORKS`);
        break; // Stop after finding first working model
      } catch (error) {
        console.log(`❌ ${modelName} - ${error.message.substring(0, 100)}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

listModels();
