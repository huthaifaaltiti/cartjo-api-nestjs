import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  /**
   * OptionalJwtAuthGuard
   * --------------------
   * A custom NestJS authentication guard that extends the built-in JWT AuthGuard.
   *
   * Purpose:
   * - Allows routes to optionally authenticate a user.
   * - If a valid JWT is provided, the user object is available in the request.
   * - If no JWT or an invalid JWT is provided, it does NOT throw an error; instead, it returns `null`.
   *
   * Usage:
   * - Apply this guard to routes where authentication is optional.
   * - Example:
   *    @UseGuards(OptionalJwtAuthGuard)
   *    @Get('optional-route')
   *    async optionalRoute(@Req() req) {
   *      const user = req.user; // may be null if not authenticated
   *      ...
   *    }
   *
   * Methods:
   * - handleRequest(err, user, info, context)
   *    - Overrides the default behavior of `AuthGuard('jwt')`.
   *    - Parameters:
   *        - err: Error object (if any occurred during authentication)
   *        - user: Decoded user object (if JWT is valid)
   *        - info: Additional info provided by Passport
   *        - context: Execution context of the request
   *    - Returns:
   *        - `user` if authentication succeeded
   *        - `null` if no valid user is found (prevents throwing 401 errors)
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's a valid user, return it
    // If not, return null instead of throwing
    return user || null;
  }
}
