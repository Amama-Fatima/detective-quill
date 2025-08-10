import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid authorization header"
      );
    }

    const token = authHeader.substring(7);

    try {
      // Verify the JWT token with Supabase
      const supabase = this.supabaseService.getClientWithAuth(token);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw new UnauthorizedException("Invalid token");
      }

      // Attach user info to request
      request.user = user;
      request.accessToken = token;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
