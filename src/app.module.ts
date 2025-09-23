import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { Auth } from './auth/entity/auth.entity';
import { User } from './user/entities/user.entity';
import { Session } from './session/entity/session.entity';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host:'localhost',
    //   port: 5432,
    //   password: '1234',
    //   username: 'postgres',
    //   entities: [Auth, User, Session],
    //   database: 'food_backend',
    //   synchronize: true,
    //   logging: true,
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
    AuthModule, SessionModule, UserModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
