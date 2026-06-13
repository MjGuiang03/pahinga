import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orgName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  description: { type: String, default: null },
  businessPermit: { type: String, default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedAt: { type: Date, default: null },
  rejectedReason: { type: String, default: null },
}, { timestamps: true });

export default mongoose.models.Agency || mongoose.model('Agency', agencySchema);
