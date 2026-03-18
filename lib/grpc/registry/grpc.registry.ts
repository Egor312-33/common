import { PROTO_PATHS } from "@trash-streamers/contracts";

export const GRPC_CLIENTS = {
  AUTH_PACKAGE: {
    package: "auth.v1",
    protoPath: PROTO_PATHS.AUTH,
    env: "AUTH_GRPC_URL",
  },
  ACCOUNT_PACKAGE: {
    package: "account.v1",
    protoPath: PROTO_PATHS.ACCOUNT,
    env: "AUTH_GRPC_URL",
  },
  USERS_PACKAGE: {
    package: "users.v1",
    protoPath: PROTO_PATHS.USERS,
    env: "USERS_GRPC_URL",
  },
  MEDIA_PACKAGE: {
    package: "media.v1",
    protoPath: PROTO_PATHS.MEDIA,
    env: "MEDIA_GRPC_URL",
  },
  VIDEO_PACKAGE: {
    package: "video.v1",
    protoPath: PROTO_PATHS.VIDEO,
    env: "VIDEO_GRPC_URL",
  },
  CATEGORY_PACKAGE: {
    package: "category.v1",
    protoPath: PROTO_PATHS.CATEGORY,
    env: "CATEGORY_GRPC_URL",
  },
  SYSTEM_CHATS_PACKAGE: {
    package: "system.chats.v1",
    protoPath: PROTO_PATHS.SYSTEM_CHATS,
    env: "SYSTEM_CHATS_GRPC_URL",
    secure: true
  }
} as const;
