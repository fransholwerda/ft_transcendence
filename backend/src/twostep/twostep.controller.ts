import { Controller, Get, Post, Body } from '@nestjs/common';
import { toDataURL } from 'qrcode';
import { VerificationDto } from './dto/verify.dto';
import * as speakeasy from 'speakeasy';

@Controller('twostep')
export class TwostepController {
  @Get('secret')
  async generateSecret() {
    const secret = await speakeasy.generateSecret({
      name:  'ft_transcendence'
    });
    const dataURL = await toDataURL(secret.otpauth_url);
    return ({
      dataURL:  dataURL,
      base32:  secret.base32
    });
  }

  @Post('verify')
  async verify(@Body() verificationDto: VerificationDto) {
    const verify = speakeasy.totp.verify({
      secret:  verificationDto.secret,
      token: verificationDto.token,
      encoding:  'base32'
    });
    return ({verified: verify});
  }
}

