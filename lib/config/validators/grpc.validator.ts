import { IsInt, IsOptional, IsString } from 'class-validator'

export class GrpcValidator {
    @IsString()
    public GRPC_HOST: string

    @IsInt()
    public GRPC_PORT: number

    @IsOptional()
    @IsString()
    public USERS_GRPC_URL: string

    @IsOptional()
    @IsString()
    public AUTH_GRPC_URL: string
}
