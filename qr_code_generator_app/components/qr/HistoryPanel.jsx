"use client";

import { IconButton, Typography } from "@material-tailwind/react";
import { StarIcon as StarOutline, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

export default function HistoryPanel({ items, onLoad, onToggleFavorite, onRemove }) {
  if (items.length === 0) {
    return (
      <Typography variant="small" color="gray">
        Codes you download will show up here.
      </Typography>
    );
  }

  return (
    <ul className="w-72 flex flex-col gap-2 max-h-80 overflow-y-auto">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-2 border border-gray-200 rounded px-2 py-1"
        >
          <button
            type="button"
            className="text-left flex-1 truncate text-sm"
            onClick={() => onLoad(item)}
            title={item.label}
          >
            {item.label}
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
            onClick={() => onRemove(item.id)}
          >
            <TrashIcon className="w-4 h-4 text-red-500" />
          </IconButton>
        </li>
      ))}
    </ul>
  );
}
