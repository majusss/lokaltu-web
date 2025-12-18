export type NativeMessage =
  | { type: "APP_READY" }
  | { type: "APP_READY_ACK" }
  | { type: "REQUEST_NFC" }
  | { type: "NFC_RESULT"; payload: string }
  | { type: "NFC_ERROR"; error: string }
  | { type: "REGISTER_PUSH_TOKEN"; token: string }
  | {
      type: "PUSH_NOTIFICATION";
      title: string;
      body: string;
      data?: Record<string, string>;
    }
  | { type: "PERMISSION_REQUEST"; permission: string }
  | { type: "PERMISSION_RESULT"; permission: string; granted: boolean };

export type NativeMessageListener = (message: NativeMessage) => void;

export interface NativeBridge {
  send: (message: NativeMessage) => void;
  on: (listener: NativeMessageListener) => () => void;
  isAvailable: () => boolean;
}
