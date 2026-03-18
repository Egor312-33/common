import * as grpc from "@grpc/grpc-js";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ClientGrpc,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";

@Injectable()
export class GrpcClientFactory {
  constructor(private readonly config: ConfigService) { }
  private clients = new Map<string, ClientGrpc>();

  public async createClient(options: {
    package: string;
    protoPath: string;
    url: string;
    secure?: boolean;
    credentials?: grpc.ChannelCredentials;
  }) {

    return ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        ...options,
        channelOptions: {
          'grpc.ssl_target_name_override': 'system-chats.service',
          'grpc.default_authority': 'system-chats.service',
        },
        loader: {
          keepCase: false,
          enums: String,
          defaults: true,
          longs: String,
          objects: true,
        },
      },
    }) as ClientGrpc;
  }

  public register(token: string, client: ClientGrpc) {
    this.clients.set(token, client);
  }

  public getClient<T extends ClientGrpc = ClientGrpc>(token: string): T {
    const client = this.clients.get(token);

    if (!client) throw new Error(`Grpc client "${token}" not found`);

    return client as T;
  }
}
