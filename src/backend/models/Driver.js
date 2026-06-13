import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  phone: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // linked driver account
  status: { type: String, enum: ['available', 'on_trip', 'inactive'], default: 'available' },
}, { timestamps: true });

export default mongoose.models.Driver || mongoose.model('Driver', driverSchema);
