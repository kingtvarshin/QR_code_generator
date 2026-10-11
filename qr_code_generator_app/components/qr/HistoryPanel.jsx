"use client";

import { useEffect, useRef, useState } from "react";
import { useQRCode } from "next-qrcode";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { StarIcon as StarOutline, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { qrTypes } from "@/lib/qrTypes";

const UNDO_WINDOW_MS = 6000;

function HistoryThumbnail({ item }) {
  const { SVG } = useQRCode();
  let text;
  try {
    text = qrTypes[item.type]?.encode(item.fields);
  } catch {
    text = null;
  }
  if (!text) return <div className="w-8 h-8 shrink-0 bg-gray-100 rounded" aria-hidden="true" />;
  return (
    <div className="w-8 h-8 shrink-0" aria-hidden="true">
      <SVG text={text} options={{ width: 32, margin: 0 }} />
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

  useEffect(() => () => clearTimeout(undoTimerRef.current), []);

  function handleRemove(item) {
    onRemove(item.id);
    clearTimeout(undoTimerRef.current);
    setUndoEntry(item);
    undoTimerRef.current = setTimeout(() => setUndoEntry(null), UNDO_WINDOW_MS);
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
          className="flex items-center justify-between gap-2 text-sm bg-blue-gray-50 rounded px-2 py-1"
        >
          <span>Code removed</span>
          <Button size="sm" variant="text" onClick={handleUndo}>
            Undo
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <Typography variant="small" color="gray">
          Codes you download will show up here.
        </Typography>
      ) : (
        <>
          <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1"
              >
                <HistoryThumbnail item={item} />
                <button
                  type="button"
                  className="text-left flex-1 min-w-0"
                  onClick={() => onLoad(item)}
                  title={item.label}
                >
                  <span className="block truncate text-sm">{item.label}</span>
                  <span className="block text-xs text-gray-500">{formatTimestamp(item.createdAt)}</span>
                </button>
                <IconButton
                  size="sm"
                  variant="text"
                  aria-label={item.isFavorite ? `Unfavorite ${item.label}` : `Favorite ${item.label}`}
                  aria-pressed={item.isFavorite}
                  onClick={() => onToggleFavorite(item.id)}
                >
                  {item.isFavorite ? (
                    <StarSolid className="w-4 h-4 text-amber-500" />
                  ) : (
                    <StarOutline className="w-4 h-4" />
                  )}
                </IconButton>
                <IconButton
                  size="sm"
                  variant="text"
                  aria-label={`Delete ${item.label}`}
                  onClick={() => handleRemove(item)}
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </IconButton>
              </li>
            ))}
          </ul>
          <Button size="sm" variant="text" color="red" className="self-start" onClick={onClearAll}>
            Clear all (keeps favorites)
          </Button>
        </>
      )}
    </div>
  );
}
