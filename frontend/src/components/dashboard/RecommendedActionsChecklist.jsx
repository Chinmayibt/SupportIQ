import { CheckSquare, ListChecks, Square, Trash2 } from "lucide-react";
import { useActionTodos } from "../../context/ActionTodosContext";

/**
 * @param {{ embedded?: boolean }} props
 */
export default function RecommendedActionsChecklist({ embedded = false }) {
  const { todos, toggleDone, removeTodo, clearCompleted } = useActionTodos();
  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  const inner =
    todos.length === 0 ? (
      <div
        className={
          embedded
            ? "rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-[#6B7280]"
            : "rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-6 text-sm text-[#6B7280]"
        }
      >
        <div className="flex items-start gap-3">
          <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-[#6366F1]" />
          <div>
            <p className="font-medium text-[#111827]">Recommended actions checklist</p>
            <p className="mt-1">
              Run a prediction from <strong>Predictions</strong> or <strong>Voice</strong>. Each recommendation is
              added here so you can track follow-ups (saved in this browser).
            </p>
          </div>
        </div>
      </div>
    ) : (
      <div className={embedded ? "" : "rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"}>
        {!embedded ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
              <ListChecks className="h-5 w-5 text-[#6366F1]" />
              Recommended actions checklist
            </h2>
            {done.length > 0 ? (
              <button
                type="button"
                onClick={clearCompleted}
                className="text-xs font-medium text-[#6366F1] hover:underline"
              >
                Clear completed ({done.length})
              </button>
            ) : null}
          </div>
        ) : (
          <div className="mb-2 flex justify-end">
            {done.length > 0 ? (
              <button
                type="button"
                onClick={clearCompleted}
                className="text-xs font-medium text-[#6366F1] hover:underline"
              >
                Clear completed ({done.length})
              </button>
            ) : null}
          </div>
        )}
        <p className={`text-xs text-[#6B7280] ${embedded ? "" : "mt-1"}`}>
          Mark done when handled. Remove rows you do not need.
        </p>

        <ul className="mt-4 max-h-[280px] space-y-2 overflow-y-auto pr-1">
          {open.map((t) => (
            <li
              key={t.id}
              className="flex gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-sm"
            >
              <button
                type="button"
                onClick={() => toggleDone(t.id)}
                className="mt-0.5 shrink-0 text-[#6B7280] transition hover:text-[#6366F1]"
                aria-label="Mark done"
              >
                <Square className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[#111827]">{t.text}</p>
                {(t.intent || t.mainClass) && (
                  <p className="mt-1 text-xs text-[#6B7280]">
                    {[t.mainClass, t.intent].filter(Boolean).join(" · ")}
                    {t.snippet ? ` · “${t.snippet}${t.snippet.length >= 120 ? "…" : ""}”` : null}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeTodo(t.id)}
                className="shrink-0 rounded-lg p-2 text-[#6B7280] hover:bg-red-50 hover:text-red-600"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {done.map((t) => (
            <li
              key={t.id}
              className="flex gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm opacity-75"
            >
              <button
                type="button"
                onClick={() => toggleDone(t.id)}
                className="mt-0.5 shrink-0 text-[#16a34a]"
                aria-label="Mark not done"
              >
                <CheckSquare className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <p className="flex-1 line-through text-[#6B7280]">{t.text}</p>
              <button
                type="button"
                onClick={() => removeTodo(t.id)}
                className="shrink-0 rounded-lg p-2 text-[#6B7280] hover:bg-red-50 hover:text-red-600"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );

  if (embedded) {
    return (
      <section className="mt-6 border-t border-[#E5E7EB] pt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          Follow-up checklist
        </h3>
        {inner}
      </section>
    );
  }

  return inner;
}
