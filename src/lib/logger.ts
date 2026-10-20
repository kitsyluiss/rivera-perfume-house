import { headers } from "next/headers";

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  event: string;
  level?: LogLevel;
  trace_id?: string;
  [key: string]: unknown;
}

export async function getTraceId(): Promise<string> {
  try {
    const headerList = await headers();
    return headerList.get("x-request-id") || "anonymous";
  } catch {
    return "system";
  }
}

export function logEvent(payload: LogPayload) {
  const level: LogLevel = payload.level || "info";
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    trace_id: payload.trace_id || "unassigned",
    ...payload,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else if (level === "debug") {
    console.debug(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  async info(event: string, meta: Record<string, unknown> = {}) {
    const trace_id = await getTraceId();
    logEvent({ event, level: "info", trace_id, ...meta });
  },
  async warn(event: string, meta: Record<string, unknown> = {}) {
    const trace_id = await getTraceId();
    logEvent({ event, level: "warn", trace_id, ...meta });
  },
  async error(event: string, meta: Record<string, unknown> = {}) {
    const trace_id = await getTraceId();
    logEvent({ event, level: "error", trace_id, ...meta });
  },
  async debug(event: string, meta: Record<string, unknown> = {}) {
    const trace_id = await getTraceId();
    logEvent({ event, level: "debug", trace_id, ...meta });
  },
};
