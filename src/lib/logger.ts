type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, event: string, meta: Record<string, unknown> = {}) {
  console[level === "warn" ? "warn" : level](
    JSON.stringify({
      level,
      event,
      time: new Date().toISOString(),
      ...meta
    })
  );
}

export const logger = {
  info: (event: string, meta?: Record<string, unknown>) => write("info", event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => write("warn", event, meta),
  error: (event: string, meta?: Record<string, unknown>) => write("error", event, meta)
};
