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

  public createClient(options: {
    package: string;
    protoPath: string;
    url: string;
    secure?: boolean;
  }) {
    let credentials = grpc.credentials.createInsecure();

    if (options.secure) {

      const CA_PEM = `-----BEGIN CERTIFICATE-----
MIIDWzCCAkOgAwIBAgIULC3LplY9Eb6Bgk4dLVPd6pNYojIwDQYJKoZIhvcNAQEL
...остальной код сертификата...
-----END CERTIFICATE-----`;

      const CERT_PEM = `-----BEGIN CERTIFICATE-----
MIIDSTCCAjGgAwIBAgIUfNy8qyRJ19+DfgdBTdo1KgeEffMwDQYJKoZIhvcNAQEL
...
-----END CERTIFICATE-----`;

      const KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEoQIBAAKCAQEAuGZUdgd7J9zjWxzqp1s5kJGuDtYWdatxaBiuCLjb3ugzlRed
...
-----END PRIVATE KEY-----`;

      // 2. Передавайте Buffer напрямую из строк (без base64 декодинга вручную)
      credentials = grpc.credentials.createSsl(
        Buffer.from(CA_PEM),
        Buffer.from(KEY_PEM),
        Buffer.from(CERT_PEM)
      );
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
