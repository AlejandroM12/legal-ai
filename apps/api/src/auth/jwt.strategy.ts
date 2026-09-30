import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requiredJwtSecret(config.get<string>('JWT_SECRET')),
    });
  }

  validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}

function requiredJwtSecret(secret: string | undefined) {
  if (!secret || secret === 'change-me-in-local-env') {
    throw new Error(
      'JWT_SECRET tiene que ser un valor propio. El de .env.example no firma tokens.',
    );
  }
  return secret;
}
