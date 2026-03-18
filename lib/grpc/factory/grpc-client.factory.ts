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
  }) {
    let credentials = grpc.credentials.createInsecure();

    if (options.secure) {
      const CA_PEM = `-----BEGIN CERTIFICATE-----
MIIDWzCCAkOgAwIBAgIULC3LplY9Eb6Bgk4dLVPd6pNYojIwDQYJKoZIhvcNAQEL
BQAwIjEgMB4GA1UEAxMXdHJhc2gtc3RyZWFtZXJzLXJvb3QtY2EwHhcNMjYwMzE4
MTE1NjU4WhcNMzYwMzE1MTE1NzI4WjAiMSAwHgYDVQQDExd0cmFzaC1zdHJlYW1l
cnMtcm9vdC1jYTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALpm/YW2
TP7Yj+76P4yFx2epmPaKGmeqIS+gOhSZ2c+IINnCREx+4UxiG75H8zq9H3GZfvsF
thaBBtNVh64j++CkqUN1NtsV920mkVKqhP08s/mexd0YS4bPjiLRE6Y/eXnAIK+X
hQ2JQA/MgreQCxc+0iEegAX3TgDkPX/TIL/vl1ZRu2daqupEfJWAn9MJ9Iq+viQW
bnex2HrqdpVUdOYtbemeO+tdaCzX8keGvHNJp2SqDQixNipAqfvwGcI/P/HjRigh
d4KJIkibdR/uOvbS76INPI4eOBCA0CMI8BWYXxhmJQMt7jlDqqnm8ZN3zeWc6/E4
cZ0JZH56OuPgqSECAwEAAaOBiDCBhTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/
BAUwAwEB/zAdBgNVHQ4EFgQUC+Aeq5pdTJ9Ztksb9EkEVXtv4q8wHwYDVR0jBBgw
FoAUC+Aeq5pdTJ9Ztksb9EkEVXtv4q8wIgYDVR0RBBswGYIXdHJhc2gtc3RyZWFt
ZXJzLXJvb3QtY2EwDQYJKoZIhvcNAQELBQADggEBAFs8oOYWE29KX6aoJZxNLMU5
VzVArkIkUv569Hic/1gRVy68wQ5bfvB8bZKJ+bo8rapbKTBVUWS8KE454qxmvCDz
vkn3mCVIhp5itToIezN5jBpN4vOHVLIK5vEPO1WAtqaX8LwxHmEaVPoD/DKtvVof
ObB+xckaNWb3/H784K1iqh3pKQ1WOkoVc7CM/fJcjMEdZYaaYthU86SZ9ym9CZPj
7Gn2qT/4Oed39JrK4bpakpV7EJPZOkKv44otW0qfooRRE4Oy0vryQNEqpKq6nAgR
9QDCNALA4SuO8pODznsET/vGRF2M1e8kBPnFNLi6Pfdfe9ncOhEB06QO6q1McL0=
-----END CERTIFICATE-----`;

      const CERT_PEM = `-----BEGIN CERTIFICATE-----
MIIDSTCCAjGgAwIBAgIUA16Da2satwVRfGWeMNcz1D1zpbowDQYJKoZIhvcNAQEL
BQAwIjEgMB4GA1UEAxMXdHJhc2gtc3RyZWFtZXJzLXJvb3QtY2EwHhcNMjYwMzE4
MTcxMTM5WhcNMjcwMzE4MTcxMjA5WjASMRAwDgYDVQQDEwdnYXRld2F5MIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApXcQ/TXj4FLE2WWDDyRZdw7+kMUG
6kQCe5uQbBKiXo4QB0Yhrx3daf6gfjEYrzkcmRTZwa2L8e+v5rFxnBsj5SFRrvF6
tcfq3w2YO7VAs8SxNBkwBK1M7qt0ynenBEiYUrSGm8RMakqh0rRMKbXRsGKU6pqW
HFwje2nuAiaXi+CU2D6f/8pzBlorGh8tw3mlZykUdh22i8cW8vKQliQOy20skrC8
ckHnE6ctw7SPtGcpdayl2Qv6h7wbtAWYtFu8K8+YG6zj9+jBfheOPu6PLF0cWCOY
ERetYNYkCmxTe5rbqbQxMAeqW4Usw9/VZePFDlB2h+3D/0hkcy2suOIvpwIDAQAB
o4GGMIGDMA4GA1UdDwEB/wQEAwIDqDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYB
BQUHAwIwHQYDVR0OBBYEFKNCcXfquYP84T0B+cv5WQwKTC6vMB8GA1UdIwQYMBaA
FAvgHquaXUyfWbZLG/RJBFV7b+KvMBIGA1UdEQQLMAmCB2dhdGV3YXkwDQYJKoZI
hvcNAQELBQADggEBAJee4T8NEFUB1MOruo5t0qW07XPHVHgskgx81U2x2AyW12MT
8N4bzwMbw0abY7rA881/eaHDEzwjA70fEOzDiAKyVp5Q2VuTc7tMeAD414bBHqr0
jmHEXZlp++Iv8FHxX1kaeW09ywoGlHMLvlPC7R/7y5A9s8MbXgGoc+5zm5Lmuptv
LvgxQ44qmmfE8bxi9670SpTx+35yW33hwV7AxmQLKCdzFCalvdj3dOrKchsc6+MP
6bOqrLhcZJ0fumu3mty9znjBVd7/RpMlxvE0T90o0mmPS4xb0uNX66QCFV5JfV0j
NjBPGCaao3dz2+SfgNNYVCpiKH3o4mJM+vHwCk0=
-----END CERTIFICATE-----`;

      const KEY_PEM = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEApXcQ/TXj4FLE2WWDDyRZdw7+kMUG6kQCe5uQbBKiXo4QB0Yh
rx3daf6gfjEYrzkcmRTZwa2L8e+v5rFxnBsj5SFRrvF6tcfq3w2YO7VAs8SxNBkw
BK1M7qt0ynenBEiYUrSGm8RMakqh0rRMKbXRsGKU6pqWHFwje2nuAiaXi+CU2D6f
/8pzBlorGh8tw3mlZykUdh22i8cW8vKQliQOy20skrC8ckHnE6ctw7SPtGcpdayl
2Qv6h7wbtAWYtFu8K8+YG6zj9+jBfheOPu6PLF0cWCOYERetYNYkCmxTe5rbqbQx
MAeqW4Usw9/VZePFDlB2h+3D/0hkcy2suOIvpwIDAQABAoIBAA1RpkEbmLoyhLyT
GpeaGhwmotXNu57D1rH9ywRIA7XkwuQzAFHI76Jb6ANVubebu0eUkWqw/jYn+wVw
0cT6Z6CcAVKPBuJMXgWSYedR0bbRZbTciixLiYkfWAlW1E+DSxpChHX+uRVH6KVo
n0Yu59rGNK0lwGDhXHcksbnj7V2e7GlQEyWy9WCNTdSwQq8BKhA5n4oehSD6OHUS
BVpQGHe2i26mRBntLG+cKNmRrHDnRTirzszrZqEetPrtOa3V4wUOP9GLWHcAONKm
DEfP58V3EiQgoatDSCFDHCG+xIpZGfm9q8WLnd83oGm0bytmzRH7ADCiJ1oB4r++
TMJnpPECgYEAwU25XSju3b0lPkPEioHHap1ndeajNH2NAQfUGlNxHpTRJrRpB201
faTTywTAl/3SLDNFHEgkXWjjP9rmklOTvG1IWFVTIj6zPVjo4UKrCAEGrS548/0K
ZBGtMeYjZ6lUZ5F/56NmC58H1R5rF4u0o94mmZnklNxhZZomWpPjYeUCgYEA2yHf
A9x7WVRVxqmbZ3lItfssOuWg6e3oGeZXDp8XGBR+bhzUsTmnx7NRZ/e8xmGLBNUi
feqbSQuQtZf8q5RnSk1Eh5LShpFJMdURvY5rmYsXLFSXoMBPxDhCZ2AoIon0Mw8Q
2nV2+e2PL6jYHciNxKgGCpBLw9FIiCq7E1kHopsCgYEAiv2rAgxTrMa7B8lMgdcN
H2Dsqn7a7Pw1rf8GCKPk23tf4/em6XsiEiS5UOoq3V7Zh4SZ9dr9otivRhPM5HwJ
51ugwDsh2qbA1KSgVpBMUCYEufOHbtCMbyWypgV3garkkM+y60i3MDX6OMh1cmm2
ynkKwjlAfbT0p0yutURPI+0CgYEAqZijY/emt9JfuKvYDNN/hOjqqILEcYihlDoD
sttKImbqGwrRSoDW6+ZK4O6J+ffQgmL6mP2URYpf60vAUINBFe6LVWo66c9UGO9R
FaY+fM17l+G4oL92fOUV77AqH+EpUMMeRhWXiYNkyHwjF5n6rvNkCZT4LouxWUHJ
HAZRtHUCgYBkWNUwuR4DLCHzfYdxvu6nd2Bpvg7JZgDD0B8ZMhN1lzNJn44jUMTr
UPZKYDgk2K64HYWZjUW85Cc3KvCJ0LDcEoepa/vOESLfhcDgPmTnK84S5M/jEWqG
wBGprTrO2M+BK9RBCJCQgc2dYurW/+/0NN/3nL0fzucVQFbR9+HAGw==
-----END RSA PRIVATE KEY-----`;

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
        'grpc.ssl_target_name_override': 'system-chats.service',
        'grpc.default_authority': 'system-chats.service',
        loader: {
          keepCase: false,
          enums: String,
          defaults: true,
          longs: String,
          objects: true,
        },
      } as any,
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
