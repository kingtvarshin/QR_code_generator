"use client";

export default function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-500">
      {message}
    </p>
  );
}
