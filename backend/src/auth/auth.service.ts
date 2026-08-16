import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(profile: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) {

    let user = await this.usersService.findByGoogleId(profile.googleId);

    if (!user) {
      user = await this.usersService.findByEmail(profile.email);
    }

    if (!user) {
      user = await this.usersService.createGoogleUser(profile);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      isGuest: user.isGuest,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async guestLogin() {
    const user = await this.usersService.createGuestUser();

    const payload = {
      sub: user.id,
      isGuest: true,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async getMe(userId: string) {
    return this.usersService.findOne(userId);
  }
}
