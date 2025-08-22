import mongoose, { Schema, Model } from 'mongoose';
import { ICampaign } from '../../types';

const campaignsSchema: Schema<ICampaign> = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    targetTags: {
        type: [String],
        default: []
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Running', 'Completed', 'Failed'],
        default: 'Draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    launchedAt: {
        type: Date,
        required: false
    }
});

campaignsSchema.index({ workspaceId: 1, status: 1 });
campaignsSchema.index({ workspaceId: 1, createdAt: -1 });

const Campaign: Model<ICampaign> = mongoose.model<ICampaign>('Campaigns', campaignsSchema);

export default Campaign;
