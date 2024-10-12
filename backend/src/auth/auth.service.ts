import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}

    getJwt(id: object) {
        const jwt = this.jwtService.sign(id);
        return ({token: jwt});
    }

    async verifyJwtAccessToken(token: string): Promise<any> {
        try {
          return this.jwtService.verify(token);
        } catch (err) {
          throw new Error('Invalid token');
        }
      }
}
