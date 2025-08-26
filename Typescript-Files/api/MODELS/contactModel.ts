import mongoose, { Schema, Model } from "mongoose";
import { IContact } from "../../types/types";

const contactSchema: Schema<IContact> = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  email: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

contactSchema.index({ workspaceId: 1, phoneNumber: 1 }, { unique: true });
contactSchema.index({ workspaceId: 1, tags: 1 });
contactSchema.index({ workspaceId: 1, createdAt: -1 });

const Contact: Model<IContact> = mongoose.model<IContact>(
  "Contacts",
  contactSchema
);

export default Contact;
