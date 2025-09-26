import { Auth } from 'src/auth/entity/auth.entity';
import { User } from 'src/user/entities/user.entity';

export type SessionOwnerRelationKey = 'customer';

export type SessionOwnerEntity = Auth;

export interface CreateSessionParams {
    owner: SessionOwnerEntity;
    relationKey: SessionOwnerRelationKey;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    authId: number;
}
