import 'dotenv/config';
import mongoose from 'mongoose';

async function testConnection() {
  console.log('Testing connection to:', process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Successfully connected to MongoDB!');
    await mongoose.connection.close();
  } catch (err) {
    console.error('Connection failed with error:');
    console.error(err);
  }
}

testConnection();
