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

      const CA_STR = 'MIIDWzCCAkOgAwIBAgIULC3LplY9Eb6Bgk4dLVPd6pNYojIwDQYJKoZIhvcNAQELBQAwIjEgMB4GA1UEAxMXdHJhc2gtc3RyZWFtZXJzLXJvb3QtY2EwHhcNMjYwMzE4MTE1NjU4WhcNMzYwMzE1MTE1NzI4WjAiMSAwHgYDVQQDExd0cmFzaC1zdHJlYW1lcnMtcm9vdC1jYTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALpm/YW2TP7Yj+76P4yFx2epmPaKGmeqIS+gOhSZ2c+IINnCREx+4UxiG75H8zq9H3GZfvsFthaBBtNVh64j++CkqUN1NtsV920mkVKqhP08s/mexd0YS4bPjiLRE6Y/eXnAIK+XhQ2JQA/MgreQCxc+0iEegAX3TgDkPX/TIL/vl1ZRu2daqupEfJWAn9MJ9Iq+viQWbnex2HrqdpVUdOYtbemeO+tdaCzX8keGvHNJp2SqDQixNipAqfvwGcI/P/HjRighd4KJIkibdR/uOvbS76INPI4eOBCA0CMI8BWYXxhmJQMt7jlDqqnm8ZN3zeWc6/E4cZ0JZH56OuPgqSECAwEAAaOBiDCBhTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUC+Aeq5pdTJ9Ztksb9EkEVXtv4q8wHwYDVR0jBBgwFoAUC+Aeq5pdTJ9Ztksb9EkEVXtv4q8wIgYDVR0RBBswGYIXdHJhc2gtc3RyZWFtZXJzLXJvb3QtY2EwDQYJKoZIhvcNAQELBQADggEBAFs8oOYWE29KX6aoJZxNLMU5VzVArkIkUv569Hic/1gRVy68wQ5bfvB8bZKJ+bo8rapbKTBVUWS8KE454qxmvCDzvkn3mCVIhp5itToIezN5jBpN4vOHVLIK5vEPO1WAtqaX8LwxHmEaVPoD/DKtvVofObB+xckaNWb3/H784K1iqh3pKQ1WOkoVc7CM/fJcjMEdZYaaYthU86SZ9ym9CZPj7Gn2qT/4Oed39JrK4bpakpV7EJPZOkKv44otW0qfooRRE4Oy0vryQNEqpKq6nAgR9QDCNALA4SuO8pODznsET/vGRF2M1e8kBPnFNLi6Pfdfe9ncOhEB06QO6q1McL0=';
      const CERT_STR = 'MIIDSTCCAjGgAwIBAgIUfNy8qyRJ19+DfgdBTdo1KgeEffMwDQYJKoZIhvcNAQELBQAwIjEgMB4GA1UEAxMXdHJhc2gtc3RyZWFtZXJzLXJvb3QtY2EwHhcNMjYwMzE4MTUxOTU3WhcNMjYwMzE4MTUyMDU3WjASMRAwDgYDVQQDEwdnYXRld2F5MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuGZUdgd7J9zjWxzqp1s5kJGuDtYWdatxaBiuCLjb3ugzlRedlZN+kAq6MiFb4OQMOtOzS4WlQmym9Ka9Uk9yBVTQEF1HuDjaqzSsYHzXfKpjH1ZQ1zT8jyFsG7XlE2hVuWM4zwwGPnwjKlrwb5fUVYVB9IpwhBeGH/sBiIckRjbKHXa8ZkHUrJQ/4gjs8gNDkuI5nvsvzv6K2TTmeuCMPvPkSU/u1RuvjG9mvwbdEPBOb9w6Odbme/xLiNsRUwXVGMXTw+3fkLnz4nkOEbVegUhsDDn+aJofv46bCgNxBiwN9/ObhKXMy6mJicOjBq5vYcFo0ot/PUgyf+oBAct6OwIDAQABo4GGMIGDMA4GA1UdDwEB/wQEAwIDqDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwHQYDVR0OBBYEFLvXZZmm9mzgBGpNO1fAUauk9JO1MB8GA1UdIwQYMBaAFAvgHquaXUyfWbZLG/RJBFV7b+KvMBIGA1UdEQQLMAmCB2dhdGV3YXkwDQYJKoZIhvcNAQELBQADggEBAJe+9iGciIQohzLep9Ou1udoxTA3X/dwh9GDKllIkFBxECopRTkevp3VLjPImIlpwBPYIXr5M2jdfXzn9Z0YWatUOa4OUipMOXV2h0FMxKzBcuRJEhCEzrJsC+0DpE58/NRAAfEPs4Me3Ehh9ShyjHc6TAaQ4gkC1Io2Vo8e8Ux6CnT4gOEzVdhKvWimyAZtSF7zSuH9csheiSPYjFdP1evX4rQOnpFWK7p+KaWBzP9Wt5EsB11ELnTbTC2k4rURF2paRTYr8CqCfJkh+g79FZaqCT+kmy2RAd0QqFTKdd/J8iMnrjF7c1FWj2yqPf4yTKtKW8AhdiV3T+2Pwcc3QVU=';
      const KEY_STR = 'MIIEoQIBAAKCAQEAuGZUdgd7J9zjWxzqp1s5kJGuDtYWdatxaBiuCLjb3ugzlRedlZN+kAq6MiFb4OQMOtOzS4WlQmym9Ka9Uk9yBVTQEF1HuDjaqzSsYHzXfKpjH1ZQ1zT8jyFsG7XlE2hVuWM4zwwGPnwjKlrwb5fUVYVB9IpwhBeGH/sBiIckRjbKHXa8ZkHUrJQ/4gjs8gNDkuI5nvsvzv6K2TTmeuCMPvPkSU/u1RuvjG9mvwbdEPBOb9w6Odbme/xLiNsRUwXVGMXTw+3fkLnz4nkOEbVegUhsDDn+aJofv46bCgNxBiwN9/ObhKXMy6mJicOjBq5vYcFo0ot/PUgyf+oBAct6OwIDAQABAoH/NmH3htet+pOqebSNf83nrDtKmhWJiiqFx61/phLexV6118KfNv3I1bJUN3SfJDQdZzwIJL3Ff1GL65tBOoUzm17n/euEu1AJLXTbYZlv89RMZ3GNZeq6kXvJ5mI+rPqYTZR1rJpfPQ5fUJ6BSmf8tzwVt4kcpdhKNiRQz3MLv6jos7BNRNRCjI1JhAbbOBWSogkJd0zZL16K3QaktHtFvPzSNR3hkraB0oy6ZMPdSP8QNGNIdQhsbzuXQIqE3AXzN8cBgNxPmbRCGa5PPPa+reOKNcNO9ozt8o3dnAbXLATEnJQsg158NoN0N2s3WiLRNJjcwfbaPbpQ4xdvSwu1AoGBAOGdESHJI/nQk/adqF2dztieLtiW5S3MDChR6eA8pDRnsb7WP5eza1p0j04CWGuncHuSaWI+ia04jx8VWQRCgxKnvuaYdSDLFPepQjqtnq7rcViR48He2zoKZMBXnJyHs7dZRrznnCbtbDP8MORyPg0C0b05WN/PBCknLWzrwJBvAoGBANE8QEsToLNwq9Dz6IyN0xZkY2msxaqPV3pX7+0YkM9P4IFXZyClWYoqMvb2lMZB6iGfMdXTJMd/TbjMu6lRICDKCN7zo9auatYYoFyHssD1AoGARDF2eTDT1/GMl7FFr65AVEdTv5G0iegwEIvZ1jZeJ5zkI9uccxz/KOMsYZbh5QBCRoeVpOVkNeBvmiSYuGnmNmBPmmGgnZ3ko4scgqHx4cs2gl/uaK4Us3FqzJxusP1ve87XS8fx8e43k2r52EMTsFkWzkwkKdnn1wyJdW+4z68CgYBAOeNuaCkAGfs/zvZfat1A18N7aUc9/S4vSS2+2nOBhE5FNKlZ2pDQiEnvknDENfY4RYz1Fa7MhfhnsocepeY2yGfvpzYhzdBHYLjoKZNB374FVeP1FGxwydVNE5HFbbRFz80HWsG+byhXYpj0N0/KYNnqPhV7r5xhzbtjy8+mBQKBgQCLJ8POrzgkgN/EUae2k3PRPEe8fhmEQigH8kj48h18xKN04vR/vAotI2TOO5GJk/pnJPhrubNiq08ma6NMTEQHozBoFgaApSnM2HrFDHdDm1e7fC3EQVJX7HNgpCJHPfhW2fI5wa4JBDk1TQmwW762iL1xX6cD9l81l3f3VSmkdw==';

      // Декодируем из Base64
      const ca = Buffer.from(CA_STR, 'base64');
      const cert = Buffer.from(CERT_STR, 'base64');
      const key = Buffer.from(KEY_STR, 'base64');

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
