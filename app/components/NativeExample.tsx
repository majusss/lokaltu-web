"use client";

import React from "react";
import {
  useNative,
  useNativeMessage,
  getEarlyLogs,
  clearEarlyLogs,
} from "@/app/lib";
import type { NativeMessage } from "@/app/lib";

export function NativeExample() {
  const { send, isAvailable, isLoading } = useNative({
    onMessage: (msg) => console.log("Native message:", msg),
  });

  const handleNFCRequest = () => {
    send({ type: "REQUEST_NFC" });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <p>Connecting to native bridge...</p>
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="p-4">
        <p>Native bridge not available. Running in browser only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4">
        <p>Native bridge available</p>
      </div>

      <div className="space-y-2 container mx-auto px-4">
        <h2 className="font-semibold">Native Communication Examples</h2>

        <button
          onClick={handleNFCRequest}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Request NFC
        </button>
      </div>

      <NativeMessageMonitor />
      <NativeLogViewer />
    </div>
  );
}

function NativeMessageMonitor() {
  const [messages, setMessages] = React.useState<NativeMessage[]>([]);

  useNativeMessage("NFC_RESULT", (msg) => {
    setMessages((prev) => [...prev, msg].slice(-5));
  });

  useNativeMessage("NFC_ERROR", (msg) => {
    setMessages((prev) => [...prev, msg].slice(-5));
  });

  useNativeMessage("REGISTER_PUSH_TOKEN", (msg) => {
    setMessages((prev) => [...prev, msg].slice(-5));
  });

  if (messages.length === 0) return null;

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Messages</h3>
      <div className="space-y-1">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm">
            {JSON.stringify(msg)}
          </div>
        ))}
      </div>
    </div>
  );
}

interface NativeLog {
  id: string;
  timestamp: string;
  type: "send" | "receive" | "error" | "info";
  message: string;
}

function NativeLogViewer() {
  const [logs, setLogs] = React.useState<NativeLog[]>([]);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const logsEndRef = React.useRef<HTMLDivElement>(null);
  const { send } = useNative();

  const addLog = React.useCallback(
    (type: "send" | "receive" | "error" | "info", message: string) => {
      setLogs((prev) =>
        [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toLocaleTimeString(),
            type,
            message,
          },
        ].slice(-50),
      );
    },
    [],
  );

  React.useEffect(() => {
    // Add early logs that happened before listener was attached
    const early = getEarlyLogs();
    early.forEach((log) => {
      addLog(log.type, JSON.stringify(log.message));
    });
    clearEarlyLogs();

    const handleNativeMessage = (e: any) => {
      const logType = e.detail?.type || "receive";
      addLog(
        logType as "send" | "receive" | "error" | "info",
        JSON.stringify(e.detail?.message || e.detail),
      );
    };

    window.addEventListener("nativeMessageReceived", handleNativeMessage);

    return () => {
      window.removeEventListener("nativeMessageReceived", handleNativeMessage);
    };
  }, [addLog]);

  React.useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLogColor = (type: NativeLog["type"]) => {
    switch (type) {
      case "send":
        return "text-blue-600";
      case "receive":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "info":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getLogPrefix = (type: NativeLog["type"]) => {
    switch (type) {
      case "send":
        return "[SEND]";
      case "receive":
        return "[RECEIVE]";
      case "error":
        return "[ERROR]";
      case "info":
        return "[INFO]";
      default:
        return "[LOG]";
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 font-semibold text-left"
      >
        Native Bridge Logs ({logs.length}) {isExpanded ? "▼" : "▶"}
      </button>

      {isExpanded && (
        <div className="max-h-96 overflow-y-auto p-3">
          {logs.length === 0 ? (
            <p className="text-sm">No logs yet</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`text-xs ${getLogColor(log.type)}`}
                >
                  <span>[{log.timestamp}]</span>
                  <span className="ml-2 font-semibold">
                    {getLogPrefix(log.type)}
                  </span>
                  <span className="ml-2">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
          <button
            onClick={() => setLogs([])}
            className="mt-3 w-full px-2 py-1 text-xs"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
