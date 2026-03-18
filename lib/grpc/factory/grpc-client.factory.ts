import * as grpc from "@grpc/grpc-js";
import { Injectable } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import {
  ClientGrpc,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";

@Injectable()
export class GrpcClientFactory {
  constructor(private readonly config: ConfigService) { }
  private clients = new Map<string, ClientGrpc>();

  public createClient(options: {
    package: string;
    protoPath: string;
    url: string;
    secure?: boolean;
  }) {
    let credentials = grpc.credentials.createInsecure();

    if (options.secure) {

      const ca = Buffer.from(this.config.getOrThrow('GRPC_SYSTEM_CHATS_CA_CERT'), 'base64');
      const cert = Buffer.from(this.config.getOrThrow('GRPC_SYSTEM_CHATS_CLIENT_CERT'), 'base64');
      const key = Buffer.from(this.config.getOrThrow('GRPC_SYSTEM_CHATS_CLIENT_KEY'), 'base64');

      credentials = grpc.credentials.createSsl(ca, key, cert);
    }
    return ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        ...options,
        credentials,
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
