import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '../../types';

const userSchema: Schema<IUser> = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    workspaces: [
        {
            workspaceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Workspace',
                required: true
            },
            workspaceName: {
                type: String,
                ref: 'Workspace',
                required: true
            },
            role: {
                type: String,
                enum: ['Editor', 'Viewer'],
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ "workspaces.workspaceId": 1 });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
