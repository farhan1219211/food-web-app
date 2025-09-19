import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entity/session.entity';
import { Repository } from 'typeorm';
import { CreateSessionParams } from './type/session-owner.type';
import { Auth } from 'src/auth/entity/auth.entity';

@Injectable()
export class SessionService {
    constructor(@InjectRepository(Session) private sessionRepository: Repository<Session>){}

    // // create session 
    // async createSession({ owner, relationKey, accessToken, refreshToken, expiresAt}
    //     :CreateSessionParams) {
    //     if (!owner) {
    //         throw new BadRequestException('Owner must be provided.');
    //     }
    //     console.log("inside createSession function: ");
    //     try {
    //         const sessionData: any = {accessToken, refreshToken, expiresAt,[relationKey]: owner };
    //         console.log(sessionData);
    //         const session = this.sessionRepository.create(sessionData);
    //         return await this.sessionRepository.save(session);
    //     } catch (error) {
    //         console.error('Session creation failed:', error);
    //         throw new BadRequestException('Failed to create session.');
    //       }
    // }
    async createSession({ auth, accessToken, refreshToken, expiresAt }: {
        auth: Auth,
        accessToken: string,
        refreshToken: string,
        expiresAt: Date
    }) {
        if (!auth) throw new BadRequestException('Auth must be provided');

        const session = this.sessionRepository.create({
            auth,
            accessToken,
            refreshToken,
            expiresAt
        });

        return this.sessionRepository.save(session);
    }

    // DELETE session by user ID
    async deleteSessionByUserId(userId: number): Promise<{ message: string }> {
        try {
            if (!userId) {
                throw new BadRequestException('User ID is required');
            }
            const result = await this.sessionRepository.delete({ auth: { id: userId } });

            if (result.affected === 0) {
                throw new NotFoundException('No sessions found for this user');
            }
            return { message: 'Sessions deleted successfully' };
        } catch (error) {
            throw new BadRequestException(error.message );
        }
    }
    
    // remove one session token
    async deleteSessionByToken(accessToken: string) {
    try {
        if (!accessToken) {
        throw new BadRequestException('Refresh token is required');
        }

        const result = await this.sessionRepository.delete({  accessToken });

        if (result.affected === 0) {
        throw new NotFoundException('Session not found ');
        }
        return {
            message: "Logout successfull"
        }
    } catch (error) {
        throw new BadRequestException(error.message)
    }
    }

    // remove all session tokens for a user
    async deleteAllSessionsForUser(authId: number): Promise<void> {
    try {
        if (!authId) {
        throw new BadRequestException('Auth ID is required');
        }

        const result = await this.sessionRepository.delete({ auth: { id: authId } });

        if (result.affected === 0) {
        throw new NotFoundException('No sessions found for this user');
        }
    } catch (error) {
        throw new BadRequestException(error.message);
    }
    }

    // find session by accesstoken
    async findSessionByAccessToken(payload: { accessToken: string, customer_id?: number }): Promise<Session> {
    console.log("value of access token is: ", payload);

    const session = await this.sessionRepository.findOne({
        where: { accessToken: payload.accessToken }
    });
    if (!session) {
        throw new NotFoundException('Session not found');
    }
    return session;
    }

}
