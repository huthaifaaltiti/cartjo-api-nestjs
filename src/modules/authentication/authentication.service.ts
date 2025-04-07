import { Injectable } from '@nestjs/common';

import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  async register(dto: RegisterDto) {
    const { username, email, password } = dto;

    return {
      message: 'User registered successfully',
      user: {
        username,
        email,
      },
    };
  }
}
