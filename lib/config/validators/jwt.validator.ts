import { IsString } from 'class-validator'

export class JwtValidator {
    @IsString()
    public JWT_SECRET_KEY: string

    @IsString()
    public JWT_ACCESS_TTL: string

    @IsString()
    public JWT_REFRESH_TTL: string
}
