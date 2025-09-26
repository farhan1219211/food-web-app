import { User } from 'src/user/entities/user.entity';

export interface AuthResponse {
    id: number;
    email: string;
}

export interface UserResponse {
    id: number;
    fullName: string;
    address?: string;
    phone: string;
    role: string;
    avatarUrl?: string;
    auth?: AuthResponse;
}

export function toUserResponse(user: User): UserResponse {
    return {
        id: user.id,
        fullName: user.fullName,
        address: user.address,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        auth: user.auth
            ? {
                  id: user.auth.id,
                  email: user.auth.email,
              }
            : undefined,
    };
}
