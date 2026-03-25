import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  status: 'Active' | 'Pending' | 'Inactive';
  value: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a lead name'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Inactive'],
      default: 'Pending',
    },
    value: {
      type: String,
      required: [true, 'Please provide a value'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);