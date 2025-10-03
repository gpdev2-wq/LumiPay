import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(uid: string): Promise<any> {
    try {
      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(uid);
      const user = await this.usersService.findByUid(decodedToken.uid);
      
      if (user) {
        return user;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async generateJwtToken(user: any) {
    const payload = { 
      uid: user.uid, 
      email: user.email,
      sub: user.uid 
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyFirebaseToken(token: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async isAdmin(uid: string): Promise<boolean> {
    try {
      const user = await this.usersService.findByUid(uid);
      return user?.role === 'admin' || user?.role === 'super_admin';
    } catch (error) {
      return false;
    }
  }
}
