import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entity/session.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class SessionService {
    constructor(@InjectRepository(Session) private sessionRepository: Repository<Session>) {}

    async createSession({
        user,
        accessToken,
        refreshToken,
        expiresAt,
    }: {
        user: User;
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    }) {
        if (!user) throw new BadRequestException('User must be provided');

        const session = this.sessionRepository.create({
            user,
            accessToken,
            refreshToken,
            expiresAt,
        });

        return this.sessionRepository.save(session);
    }

    // DELETE session by user ID
    async deleteSessionByUserId(userId: number): Promise<{ message: string }> {
        if (!userId) {
            throw new BadRequestException('User ID is required');
        }

        try {
            const result = await this.sessionRepository.delete({ user: { id: userId } });

            if (result.affected === 0) {
                return { message: 'No sessions found for this user' };
            }

            return { message: 'Sessions deleted successfully' };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // remove one session token
    async deleteSessionByToken(accessToken: string) {
        try {
            if (!accessToken) {
                throw new BadRequestException('Refresh token is required');
            }

            const result = await this.sessionRepository.delete({ accessToken });

            if (result.affected === 0) {
                throw new NotFoundException('Session not found ');
            }
            return {
                message: 'Logout successfull',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // remove all session tokens for a user
    async deleteAllSessionsForUser(userId: number): Promise<void> {
        try {
            if (!userId) {
                throw new BadRequestException('User ID is required');
            }

            const result = await this.sessionRepository.delete({ user: { id: userId } });

            if (result.affected === 0) {
                throw new NotFoundException('No sessions found for this user');
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // find session by accesstoken
    async findSessionByAccessToken(accessToken: string): Promise<Session> {
        try {
            const session = await this.sessionRepository.findOne({
                where: { accessToken: accessToken },
            });
            if (!session) {
                throw new NotFoundException('Session not found');
            }
            return session;
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }
}
