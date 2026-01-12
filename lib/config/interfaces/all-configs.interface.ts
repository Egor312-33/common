
import type { DatabaseConfig } from './database.interface'
import type { GrpcConfig } from './grpc.interface'
import type { JwtConfig } from './jwt.interface'
import type { RedisConfig } from './redis.interface'
import type { RmqConfig } from './rmq.interface'

export interface AllConfigs {
    grpc: GrpcConfig
    database: DatabaseConfig
    redis: RedisConfig
    jwt: JwtConfig,
    rmq: RmqConfig
}
