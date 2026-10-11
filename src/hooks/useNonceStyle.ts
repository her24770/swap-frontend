"use client";

import { useEffect, useLayoutEffect } from "react";

// Este hook inyecta una etiqueta <style> con el nonce de la
// request cuando el valor CSS depende de datos calculados en runtime
function getCspNonce(): string | undefined {
  return document.documentElement.dataset.cspNonce;
}

export function useNonceStyle(id: string, css: string | null) {
  useLayoutEffect(() => {
    if (css === null) return;

    let styleEl = document.getElementById(id) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = id;
      const nonce = getCspNonce();
      if (nonce) styleEl.nonce = nonce;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }, [id, css]);

  useEffect(() => {
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [id]);
}
