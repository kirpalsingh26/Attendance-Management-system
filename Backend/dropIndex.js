require('dotenv').config();
const mongoose = require('mongoose');

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('timetables');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Drop the problematic index
    try {
      await collection.dropIndex('subjects.name_1');
      console.log('✅ Successfully dropped subjects.name_1 index');
    } catch (error) {
      console.log('Index might not exist:', error.message);
    }

    // List indexes after dropping
    const indexesAfter = await collection.indexes();
    console.log('Indexes after drop:', JSON.stringify(indexesAfter, null, 2));

    await mongoose.connection.close();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropIndex();
