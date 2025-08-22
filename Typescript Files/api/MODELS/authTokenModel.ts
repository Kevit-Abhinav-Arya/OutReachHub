import mongoose, { Schema, Model } from 'mongoose';
import { IAuthToken } from '../../types/types';

const authTokenSchema: Schema<IAuthToken> = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['access', 'refresh'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

authTokenSchema.index({ userId: 1 });
authTokenSchema.index({ token: 1 });
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AuthToken: Model<IAuthToken> = mongoose.model<IAuthToken>('AuthToken', authTokenSchema);

export default AuthToken;
