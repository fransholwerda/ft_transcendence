import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateTokenReq } from './dto/create-tokenreq.dto';
import { CreateAccessToken } from './dto/create-accesstoken.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

  @Post('token')
  async token(@Body() createTokenReq: CreateTokenReq) {
    const url: string = `https://api.intra.42.fr/oauth/token?grant_type=${createTokenReq.grant_type}&client_id=${createTokenReq.client_id}&client_secret=${process.env.API_SECRET}&code=${createTokenReq.auth_code}&redirect_uri=${createTokenReq.redirect_uri}`;
    const response = await fetch(url, {
      method:  'POST'
    });
    const result = await response.json();
    return (result);
  }

  @Post('intra_user')
  async intra_user(@Body() createAccessToken: CreateAccessToken) {
    const response = await fetch('https://api.intra.42.fr/v2/me', {
      method:  'GET',
      headers: {
        'Authorization':  `${createAccessToken.token_type} ${createAccessToken.access_token}`
      }
    });
    const result = await response.json();
    return (result);
  }

  @Get('jwt/:id')
  async jwt_user(@Param('id') id: string) {
      return (this.authService.getJwt({user: id}));
  }
}
