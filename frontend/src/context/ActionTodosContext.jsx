import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "supportiq-recommended-action-todos-v1";
const MAX_TODOS = 80;

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

/** Split a recommended_action string into separate checklist lines when possible. */
export function splitRecommendedActions(text) {
  if (!text || typeof text !== "string") return [];
  const raw = text.trim();
  if (!raw) return [];

  const byNewline = raw
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  if (byNewline.length > 1) return byNewline;

  const bySemi = raw
    .split(/;\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  if (bySemi.length > 1) return bySemi;

  const bySentence = raw
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
  if (bySentence.length > 1) {
    return bySentence.map((s) => (s.endsWith(".") ? s : `${s}.`));
  }

  return [raw];
}

const ActionTodosContext = createContext(null);

export function ActionTodosProvider({ children }) {
  const [todos, setTodos] = useState(loadStored);

  useEffect(() => {
    persist(todos);
  }, [todos]);

  const addFromPrediction = useCallback((prediction) => {
    if (!prediction?.recommended_action) return;
    const parts = splitRecommendedActions(prediction.recommended_action);
    const base = Date.now();
    const snippet =
      (prediction.translated_text || prediction.input_text || "")
        .toString()
        .slice(0, 120) || null;

    setTodos((prev) => {
      const incoming = parts.map((text, i) => ({
        id: `${base}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        done: false,
        createdAt: new Date().toISOString(),
        intent: prediction.intent ?? null,
        mainClass: prediction.main_class ?? null,
        snippet,
      }));
      const merged = [...incoming, ...prev];
      return merged.slice(0, MAX_TODOS);
    });
  }, []);

  const toggleDone = useCallback((id) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const removeTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.done));
  }, []);

  const value = useMemo(
    () => ({
      todos,
      addFromPrediction,
      toggleDone,
      removeTodo,
      clearCompleted,
    }),
    [todos, addFromPrediction, toggleDone, removeTodo, clearCompleted],
  );

  return <ActionTodosContext.Provider value={value}>{children}</ActionTodosContext.Provider>;
}

export function useActionTodos() {
  const ctx = useContext(ActionTodosContext);
  if (!ctx) {
    throw new Error("useActionTodos must be used within ActionTodosProvider");
  }
  return ctx;
}
