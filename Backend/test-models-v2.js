const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const testModels = async () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-2.0-flash-exp',
    'gemini-exp-1206'
  ];
  
  console.log('Testing Gemini models with vision capability...\n');
  
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Test with simple text first
      const result = await model.generateContent(['Say "OK"']);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} - WORKS! Response: ${text.substring(0, 20)}`);
      
      // If text works, try with vision (using a simple test)
      try {
        const visionResult = await model.generateContent([
          'What color is shown in this image?',
          {
            inlineData: {
              data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
              mimeType: 'image/png'
            }
          }
        ]);
        console.log(`   ✅ Vision capability: YES`);
        return modelName; // Return first working model with vision
      } catch (visionError) {
        console.log(`   ⚠️  Vision capability: NO (${visionError.message.substring(0, 50)})`);
      }
      
    } catch (error) {
      const msg = error.message.substring(0, 100);
      console.log(`❌ ${modelName} - ${msg}`);
    }
  }
  
  console.log('\n⚠️  No models with vision capability found.');
};

testModels();
