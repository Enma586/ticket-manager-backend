import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                JwtStrategy.extractJWT,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    private static extractJWT(req: Request): string | null {
        if (req.cookies && req.cookies['access_token']) {
            return req.cookies['access_token'];
        }
        return null;
    }

    async validate(payload: any){
        if (!payload.sub || !payload.email){
            throw new UnauthorizedException('Token invalidated')
        }

        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role
        }
    };
}

