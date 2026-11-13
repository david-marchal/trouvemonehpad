"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export const MAX_COMPARE = 3;

const KEY = "compare-ids";
const EVENT = "compare-change";
const VALID_ID = /^[0-9A-Za-z]{9}$/;

// Si le navigateur refuse le stockage (navigation privée…), on garde la sélection en mémoire.
let memory = "";

function readRaw(): string {
  try {
    return window.localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function writeIds(ids: string[]) {
  memory = ids.join(",");
  try {
    window.localStorage.setItem(KEY, memory);
  } catch {
    // Le stockage est indisponible : la mémoire suffit pour cette page.
  }
  window.dispatchEvent(new Event(EVENT));
}

function parse(raw: string): string[] {
  return raw
    ? Array.from(new Set(raw.split(",").filter((id) => VALID_ID.test(id)))).slice(0, MAX_COMPARE)
    : [];
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useCompareSelection() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "");
  const ids = useMemo(() => parse(raw), [raw]);

  /** Ajoute ou retire un établissement. Renvoie false si la sélection est pleine. */
  const toggle = useCallback((id: string): boolean => {
    const current = parse(readRaw());
    if (current.includes(id)) {
      writeIds(current.filter((x) => x !== id));
      return true;
    }
    if (current.length >= MAX_COMPARE) return false;
    writeIds([...current, id]);
    return true;
  }, []);

  const clear = useCallback(() => writeIds([]), []);

  return { ids, toggle, clear, isFull: ids.length >= MAX_COMPARE };
}
