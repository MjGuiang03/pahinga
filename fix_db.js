import mongoose from 'mongoose';
import dbConnect from './src/backend/lib/db.js';

async function fix() {
  await dbConnect();
  // Bypass mongoose schema caching by using native MongoDB driver
  const db = mongoose.connection.db;
  
  // Find drivers with 'N/A' license and set their role to coordinator
  const result = await db.collection('drivers').updateMany(
    { licenseNumber: 'N/A' },
    { $set: { role: 'coordinator' } }
  );
  console.log('Fixed', result.modifiedCount, 'records.');
  process.exit(0);
}
fix();
