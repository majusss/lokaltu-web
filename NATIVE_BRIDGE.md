# useNative Hook - WebView ↔ Native Communication

Complete implementation of bidirectional JSON-based communication between Next.js/React app running in Android WebView and native Kotlin code.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│     Android (Kotlin + XML)              │
│  ┌────────────────────────────────────┐ │
│  │  Activity + WebView (Layout XML)   │ │
│  │  - NfcAdapter                      │ │
│  │  - FCM + Local Notifications       │ │
│  │  - JavaScriptInterface Bridge      │ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │ JSON API (postMessage)
┌──────────────▼──────────────────────────┐
│     Web (Next.js + React)               │
│  ┌────────────────────────────────────┐ │
│  │  NativeProvider (Root)             │ │
│  │  - initNativeBridge()              │ │
│  │  - window.__nativeDispatch         │ │
│  │  - window.AndroidBridge            │ │
│  └────────────────────────────────────┘ │
│                                         │
│  Components / Hooks:                   │
│  - useNative()                         │
│  - useNFC()                            │
│  - usePushNotifications()              │
│  - useNativeMessage()                  │
└─────────────────────────────────────────┘
```

## Setup

### 1. Wrap your app with NativeProvider

In [app/layout.tsx](app/layout.tsx):

```tsx
import { NativeProvider } from "@/app/lib";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NativeProvider>{children}</NativeProvider>
      </body>
    </html>
  );
}
```

### 2. Android Kotlin Implementation

Create `NativeBridge.kt`:

```kotlin
import android.webkit.JavascriptInterface
import android.util.Log
import org.json.JSONObject

class NativeBridge(private val webView: WebView) {

    @JavascriptInterface
    fun postMessage(json: String) {
        try {
            val message = JSONObject(json)
            val type = message.getString("type")

            Log.d("NativeBridge", "Received: $type")

            when (type) {
                "APP_READY" -> handleAppReady()
                "REQUEST_NFC" -> handleNFCRequest()
                "REGISTER_PUSH_TOKEN" -> registerPushToken()
                "PERMISSION_REQUEST" -> {
                    val permission = message.getString("permission")
                    handlePermission(permission)
                }
                else -> Log.w("NativeBridge", "Unknown message type: $type")
            }
        } catch (e: Exception) {
            Log.e("NativeBridge", "Error parsing message", e)
        }
    }

    private fun handleAppReady() {
        Log.d("NativeBridge", "App ready, sending handshake response")
        // Send acknowledgement back to web
        sendToWeb("APP_READY_ACK")
    }

    private fun handleNFCRequest() {
        // Your NFC handling logic
        // When tag is detected:
        sendToWeb("NFC_RESULT", """{"payload":"tag_data_here"}""")
    }

    private fun registerPushToken() {
        // Your FCM token logic
        val token = "fcm_token_here"
        sendToWeb("REGISTER_PUSH_TOKEN", """{"token":"$token"}""")
    }

    private fun handlePermission(permission: String) {
        // Your permission handling
        sendToWeb("PERMISSION_RESULT",
            """{"permission":"$permission","granted":true}""")
    }

    private fun sendToWeb(type: String, payload: String = "{}") {
        val json = """{
            "type": "$type",
            ${if (payload != "{}") payload.substring(1) else ""}
        }""".trimIndent()

        val script = """
            (function() {
                const message = JSON.parse('${json.replace("'", "\\'")}');
                if (message.type === 'APP_READY_ACK') {
                    window.__nativeReady?.(true);
                }
                window.__nativeDispatch?.(message);
            })();
        """.trimIndent()

        webView.evaluateJavascript(script) { result ->
            Log.d("NativeBridge", "Executed: $result")
        }
    }
}
```

In your Activity (`MainActivity.kt`):

```kotlin
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val webView: WebView = findViewById(R.id.webview)

        // Configure WebView
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
        }

        webView.webViewClient = WebViewClient()

        // Add bridge - CRITICAL: only expose postMessage method
        val bridge = NativeBridge(webView)
        webView.addJavascriptInterface(bridge, "AndroidBridge")

        // Load your Next.js app
        webView.loadUrl("https://your-domain.com")
    }
}
```

## Usage

### Basic Communication

```tsx
import { useNative } from "@/app/lib";

export function MyComponent() {
  const { send, isAvailable } = useNative({
    onMessage: (msg) => {
      console.log("From native:", msg);
    },
  });

  return (
    <button onClick={() => send({ type: "REQUEST_NFC" })}>Tap NFC Tag</button>
  );
}
```

### NFC Operations

```tsx
import { useNFC, useNativeMessage } from "@/app/lib";

export function NFCComponent() {
  const { requestNFC, lastNFCData } = useNFC();

  useNativeMessage("NFC_RESULT", (msg) => {
    console.log("NFC data:", msg.payload);
  });

  useNativeMessage("NFC_ERROR", (msg) => {
    console.error("NFC failed:", msg.error);
  });

  return (
    <div>
      <button onClick={requestNFC}>Start NFC</button>
      {lastNFCData && <p>Tag: {lastNFCData}</p>}
    </div>
  );
}
```

### Push Notifications

```tsx
import { usePushNotifications, useNativeMessage } from "@/app/lib";

export function NotificationComponent() {
  const { token, requestToken } = usePushNotifications();

  useNativeMessage("PUSH_NOTIFICATION", (msg) => {
    console.log("Notification:", msg.title, msg.body);
  });

  return (
    <div>
      <button onClick={requestToken}>Get Push Token</button>
      {token && <p>Token: {token}</p>}
    </div>
  );
}
```

### Listening to Specific Messages

```tsx
import { useNativeMessage } from "@/app/lib";

export function PermissionComponent() {
  useNativeMessage("PERMISSION_RESULT", (msg) => {
    if (msg.granted) {
      console.log(`Permission ${msg.permission} granted`);
    }
  });

  return <div>Waiting for permission results...</div>;
}
```

## Message Types

```typescript
type NativeMessage =
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
```

## API Reference

### `useNative(options?)`

Main hook for native communication.

```tsx
const { send, isAvailable, isEnabled } = useNative({
  onMessage: (msg) => {
    /* handle message */
  },
  enabled: true, // Optional, default: true
});

send({ type: "REQUEST_NFC" }); // Send to native
```

### `useNativeMessage(type, handler, enabled?)`

Listen to specific message types.

```tsx
useNativeMessage("NFC_RESULT", (msg) => {
  console.log(msg.payload); // Type-safe access
});
```

### `useNFC()`

Convenience hook for NFC operations.

```tsx
const { requestNFC, lastNFCData } = useNFC();
```

### `usePushNotifications()`

Convenience hook for push notifications.

```tsx
const { token, requestToken } = usePushNotifications();
```

### `useNativePermission(permission)`

Request and check specific permissions.

```tsx
const { granted, request } = useNativePermission("android.permission.NFC");
request(); // Request permission from native
```

## Security Best Practices

✅ **DO:**

- Only expose `postMessage` method via `addJavascriptInterface`
- Validate all JSON messages on native side (type, required fields)
- Load only your own domain in WebView
- Use HTTPS in production
- Ignore malformed or unexpected messages

❌ **DON'T:**

- Expose multiple methods via `addJavascriptInterface` (XSS → RCE)
- Load untrusted URLs in WebView
- Skip JSON validation on native side
- Handle sensitive data without encryption

### WebView Security Configuration

```kotlin
webView.settings.apply {
    javaScriptEnabled = true
    // Disable dangerous features
    allowFileAccess = false
    allowContentAccess = false
    mixedContentMode = WebSettings.MIXED_CONTENT_NEVER
}

// Only allow your domain
webView.webViewClient = object : WebViewClient() {
    override fun shouldOverrideUrlLoading(
        view: WebView?,
        request: WebResourceRequest?
    ): Boolean {
        return !request?.url?.host?.endsWith("your-domain.com") ?: false
    }
}
```

## Troubleshooting

### Bridge not available

- Ensure `NativeProvider` wraps your app
- Check Android's `addJavascriptInterface` is called before `loadUrl`
- Verify `javaScriptEnabled = true` in WebView settings

### Messages not being received

- Check native side logs with `adb logcat | grep NativeBridge`
- Verify `__nativeDispatch` is defined: `console.log(window.__nativeDispatch)`
- Ensure message type matches expectations

### JSON parse errors

- Validate JSON on both sides
- Use `JSON.stringify()` consistently
- Check for circular references or non-serializable data

## File Structure

```
app/
├── lib/
│   ├── index.ts                    # Barrel export
│   ├── native-bridge.ts            # Core bridge logic
│   ├── types/
│   │   └── native.ts              # TypeScript types
│   ├── hooks/
│   │   └── useNative.ts           # All hooks
│   └── contexts/
│       └── NativeProvider.tsx      # Provider component
├── components/
│   └── NativeExample.tsx           # Example component
└── layout.tsx                      # Updated with NativeProvider
```

## Example Integration

See [app/components/NativeExample.tsx](app/components/NativeExample.tsx) for a complete working example with UI.
