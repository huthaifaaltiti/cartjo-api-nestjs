import { Controller, Post, Body } from '@nestjs/common';
import { getMessage } from 'src/common/utils/translator';
import { ApiError } from 'src/common/utils/errorsHandling/ApiError';
import { AuthorizationService } from './authorization.service';
import { LoginDto } from './dto/login.dto';
import { ApiPaths } from 'src/common/constants/api-paths';

@Controller(ApiPaths.Authorization.Root)
export class AuthorizationController {
  constructor(private readonly authService: AuthorizationService) {}

  @Post(ApiPaths.Authorization.Login)
  async login(
    @Body()
    body: LoginDto,
  ) {
    try {
      const { token } = await this.authService.login(
        body.identifier,
        body.password,
        body.rememberMe,
        body.lang,
      );

      return {
        message: getMessage('authorization_loginSuccessful', body.lang),
        token,
      };
    } catch (err) {
      throw new ApiError(500, err.message);
    }
  }
}
