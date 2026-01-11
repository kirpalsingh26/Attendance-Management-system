require('dotenv').config();
const mongoose = require('mongoose');

const clearTimetables = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('timetables');

    // Delete all timetables
    const result = await collection.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} timetables`);

    await mongoose.connection.close();
    console.log('Done! You can now create a fresh timetable.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearTimetables();
