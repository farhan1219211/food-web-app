import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Auth } from './auth/entity/auth.entity';
import { User } from './user/entities/user.entity';
import { Session } from './session/entity/session.entity';
import { EmailModule } from './email/email.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { CuisineModule } from './cuisine/cuisine.module';
import { MenuModule } from './menu/menu.module';

@Module({
    imports: [
        // TypeOrmModule.forRootAsync({
        //   imports: [ConfigModule],
        //   inject: [ConfigService],
        //   useFactory: (configService: ConfigService) => ({
        //     type: 'postgres',
        //     host: configService.get<string>('DB_HOST', 'localhost'),
        //     port: configService.get<number>('DB_PORT', 5432),
        //     username: configService.get<string>('DB_USER', 'postgres'),
        //     password: configService.get<string>('DB_PASS', '1234'),
        //     database: configService.get<string>('DB_NAME', 'food_backend'),
        //     entities: [Auth, User, Session],
        //     synchronize: true,
        //     logging: true,
        //   }),
        // }),
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('SUPABASE_DB'),
                autoLoadEntities: true,
                synchronize: true,
            }),
        }),
        AuthModule,
        SessionModule,
        UserModule,
        EmailModule,
        RestaurantModule,
        CuisineModule,
        MenuModule,
    ],
})
export class AppModule {}
