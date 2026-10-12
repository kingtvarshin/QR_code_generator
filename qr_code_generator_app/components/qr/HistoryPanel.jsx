"use client";

import { useEffect, useRef, useState } from "react";
import { StarIcon as StarOutline, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { qrTypes } from "@/lib/qrTypes";
import QrSvg from "./QrSvg";

const UNDO_WINDOW_MS = 9000;

function HistoryThumbnail({ item }) {
  let text;
  try {
    text = qrTypes[item.type]?.encode(item.fields);
  } catch {
    text = null;
  }
  if (!text) return <div className="w-8 h-8 shrink-0 bg-slate-100 dark:bg-slate-700 rounded" aria-hidden="true" />;
  return (
    // Deliberately plain white, not dark:bg-slate-* — same scan-contrast
    // exception as the main preview plate and MiniPreview's thumbnail.
    <div className="w-8 h-8 shrink-0 bg-white rounded p-0.5" aria-hidden="true">
      <QrSvg text={text} options={{ width: 32, margin: 0 }} />
    </div>
  );
}

function formatTimestamp(ms) {
  try {
    return new Date(ms).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function HistoryPanel({ items, onLoad, onToggleFavorite, onRemove, onRestore, onClearAll }) {
  const [undoEntry, setUndoEntry] = useState(null);
  const undoTimerRef = useRef(null);
  const undoButtonRef = useRef(null);

  useEffect(() => () => clearTimeout(undoTimerRef.current), []);

  // Focus would otherwise drop to <body> once the clicked delete button is removed
  // from the DOM — move it to the Undo action so keyboard/screen-reader users land
  // somewhere meaningful instead of losing their place entirely.
  useEffect(() => {
    if (undoEntry) undoButtonRef.current?.focus();
  }, [undoEntry]);

  function startUndoTimer() {
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoEntry(null), UNDO_WINDOW_MS);
  }

  function handleRemove(item) {
    onRemove(item.id);
    setUndoEntry(item);
    startUndoTimer();
  }

  function handleUndo() {
    if (!undoEntry) return;
    onRestore(undoEntry);
    clearTimeout(undoTimerRef.current);
    setUndoEntry(null);
  }

  return (
    <div className="w-72 flex flex-col gap-2">
      {undoEntry && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-100 rounded px-2 py-1"
          onMouseEnter={() => clearTimeout(undoTimerRef.current)}
          onMouseLeave={startUndoTimer}
          onFocus={() => clearTimeout(undoTimerRef.current)}
          onBlur={startUndoTimer}
        >
          <span>Code removed</span>
          <button
            ref={undoButtonRef}
            type="button"
            className="text-indigo-600 dark:text-indigo-400 font-medium px-2"
            onClick={handleUndo}
          >
            Undo
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Codes you download will show up here.</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-xl border border-slate-200/70 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm px-2 py-1 transition-colors hover:bg-white/80 dark:hover:bg-slate-800/70"
              >
                <HistoryThumbnail item={item} />
                <button type="button" className="text-left flex-1 min-w-0" onClick={() => onLoad(item)} title={item.label}>
                  <span className="block truncate text-sm text-slate-900 dark:text-slate-100">{item.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{formatTimestamp(item.createdAt)}</span>
                </button>
                <button
                  type="button"
                  className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label={item.isFavorite ? `Unfavorite ${item.label}` : `Favorite ${item.label}`}
                  aria-pressed={item.isFavorite}
                  onClick={() => onToggleFavorite(item.id)}
                >
                  {item.isFavorite ? (
                    <StarSolid className="w-4 h-4 text-amber-500" />
                  ) : (
                    <StarOutline className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  )}
                </button>
                <button
                  type="button"
                  className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label={`Delete ${item.label}`}
                  onClick={() => handleRemove(item)}
                >
                  <TrashIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="self-start text-sm text-red-600 dark:text-red-400 font-medium px-2 py-1"
            onClick={onClearAll}
          >
            Clear all (keeps favorites)
          </button>
        </>
      )}
    </div>
  );
}
