import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { CuisineModule } from './cuisine/cuisine.module';
import { MenuModule } from './menu/menu.module';
import { FavouriteModule } from './favourite/favourite.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USER', 'postgres'),
            password: configService.get<string>('DB_PASS', '1234'),
            database: configService.get<string>('DB_NAME', 'food_backend'),
            autoLoadEntities:true,
            synchronize: true,
            logging: true,
          }),
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        // TypeOrmModule.forRootAsync({
        //     imports: [ConfigModule],
        //     inject: [ConfigService],
        //     useFactory: (configService: ConfigService) => ({
        //         type: 'postgres',
        //         url: configService.get<string>('SUPABASE_DB'),
        //         autoLoadEntities: true,
        //         synchronize: true,
        //     }),
        // }),
        AuthModule,
        SessionModule,
        UserModule,
        EmailModule,
        RestaurantModule,
        CuisineModule,
        MenuModule,
        FavouriteModule,
        CartModule,
        OrderModule,
        ReviewModule,
    ],
})
export class AppModule {}
