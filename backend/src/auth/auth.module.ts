import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'temp_secret',
      signOptions: { expiresIn: '1d' }
  })],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
