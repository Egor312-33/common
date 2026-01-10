import { IsNumber, IsString } from 'class-validator'

export class JwtValidator {
    @IsString()
    public JWT_SECRET_KEY: string

    @IsNumber()
    public JWT_ACCESS_TTL: number

    @IsNumber()
    public JWT_REFRESH_TTL: number
}
