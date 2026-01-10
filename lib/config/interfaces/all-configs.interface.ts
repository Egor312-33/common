
import type { DatabaseConfig } from './database.interface'
import type { GrpcConfig } from './grpc.interface'
import { JwtConfig } from './jwt.interface'
import { RedisConfig } from './redis.interface'

export interface AllConfigs {
    grpc: GrpcConfig
    database: DatabaseConfig
    redis: RedisConfig
    jwt: JwtConfig
}
