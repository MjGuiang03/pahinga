import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  hikerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adventureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Adventure', required: true },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  flagged: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
