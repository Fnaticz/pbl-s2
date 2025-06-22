import mongoose from 'mongoose';

const MemberApplicationSchema = new mongoose.Schema({
  username: String,
  email: String,
  name: String,
  address: String,
  phone: String,
  hobby: String,
  vehicleType: String,
  vehicleSpec: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.models.MemberApplication || mongoose.model('MemberApplication', MemberApplicationSchema);
