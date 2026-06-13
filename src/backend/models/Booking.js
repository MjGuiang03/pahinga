import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true, unique: true },
  hikerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adventureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Adventure', required: true },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  paxCount: { type: Number, required: true, default: 1 },
  totalAmount: { type: Number, required: true },
  pickupNeeded: { type: Boolean, default: false },
  pickupAddress: { type: String, default: null },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, enum: ['gcash', 'card', 'arrival'], required: true },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  gcashReference: { type: String, default: null },
  cardNumber: { type: String, default: null }, // Mocked card last 4 digits
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  transportStatus: { type: String, enum: ['pending', 'assigned', 'picked_up', 'dropped_off'], default: 'pending' },
  pickupTime: { type: Date, default: null },
  refundRequest: {
    status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    amount: { type: Number, default: 0 },
    reason: { type: String, default: '' },
    remarks: { type: String, default: '' },
    processedAt: { type: Date, default: null }
  },
  reviewLeft: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
