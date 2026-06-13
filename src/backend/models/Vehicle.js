import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  plateNumber: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'Van', 'SUV', etc.
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['available', 'on_trip', 'inactive'], default: 'available' },
}, { timestamps: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
