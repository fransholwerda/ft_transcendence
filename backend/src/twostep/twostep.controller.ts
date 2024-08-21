import { Controller, Get } from '@nestjs/common';
import { toDataURL } from 'qrcode';
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
}
