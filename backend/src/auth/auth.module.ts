import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'temp_secret',
      signOptions: { expiresIn: '1d' }
    })
  ],
  controllers: [ AuthController ],
  providers: [ AuthService ]
})
export class AuthModule {}
