import mongoose from 'mongoose';

const adventureSchema = new mongoose.Schema({
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  title: { type: String, required: true },
  mountain: { type: String, default: '' },
  adventureType: [{ type: String }], // e.g., 'Hiking', 'Diving', 'Surfing', etc.
  difficulty: { type: String, enum: ['easy', 'moderate', 'difficult'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true },
  maxSlots: { type: Number, required: true },
  slotsRemaining: { type: Number, required: true },
  inclusions: { type: String, default: '' },
  itinerary: { type: String, default: '' },
  image: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  location: { type: String, required: true }, // e.g., 'Kabayan, Benguet'
  region: { type: String, enum: ['Luzon', 'Visayas', 'Mindanao'], default: 'Luzon' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Adventure || mongoose.model('Adventure', adventureSchema);
