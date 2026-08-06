"use client";

import { type Dispatch, type ReactNode, type SetStateAction, useCallback, useEffect, useState } from "react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastEventDetail = {
  message: string;
  tone?: ToastTone;
};

const toastEvent = "shortvideoauto:toast";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(event: Event) {
      const detail = (event as CustomEvent<ToastEventDetail>).detail;
      if (!detail?.message) return;
      const id = Date.now() + Math.random();
      setToasts((current) => [...current.slice(-3), { id, message: detail.message, tone: detail.tone ?? inferToastTone(detail.message) }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4200);
    }

    window.addEventListener(toastEvent, onToast);
    return () => window.removeEventListener(toastEvent, onToast);
  }, []);

  return (
    <>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-label="Thông báo">
        {toasts.map((toast) => (
          <button
            className={`toast toast-${toast.tone}`}
            type="button"
            key={toast.id}
            onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
          >
            <span className="toast-dot" aria-hidden="true" />
            <span>{toast.message}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export function showToast(message: string, tone = inferToastTone(message)) {
  if (typeof window === "undefined" || !message.trim()) return;
  window.dispatchEvent(new CustomEvent<ToastEventDetail>(toastEvent, { detail: { message, tone } }));
}

export function useToastState(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const setToastValue: Dispatch<SetStateAction<string>> = useCallback((nextValue) => {
    setValue((currentValue) => {
      const resolvedValue = typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
      showToast(resolvedValue);
      return resolvedValue;
    });
  }, []);

  return [value, setToastValue] as const;
}

function inferToastTone(message: string): ToastTone {
  return /fail|failed|error|invalid|không|chưa|lỗi|thất bại|required/i.test(message) ? "error" : "success";
}
