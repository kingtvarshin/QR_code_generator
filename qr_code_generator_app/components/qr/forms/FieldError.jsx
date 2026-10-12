"use client";

// No role="alert" here on purpose — it would interrupt with every keystroke while
// the field is still being typed. The message is still available via the input's
// aria-describedby, so a screen reader announces it when the field is focused.
export default function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-red-500 dark:text-red-400">
      {message}
    </p>
  );
}
