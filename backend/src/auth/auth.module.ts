import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'temp_secret',
      signOptions: { expiresIn: '1d' }
    })
  ],
  controllers: [ AuthController ],
  providers: [ AuthService, JwtStrategy ]
})
export class AuthModule {}
