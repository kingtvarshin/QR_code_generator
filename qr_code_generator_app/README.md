# QR Forge

A QR code generator built with Next.js. Generate codes for URLs, plain text, phone numbers, SMS,
email, WiFi networks, and contact cards (vCard), then customize and download them.

## Features

- **7 content types**: URL, Text, Phone, SMS, Email, WiFi, Contact (vCard) — each with its own
  form, correct URI/vCard encoding, and inline validation.
- **Customization**: error-correction level, size, margin, foreground/background color (with a
  low-contrast warning), and an optional center logo.
- **Download**: export as PNG, JPEG, or SVG at a higher resolution than the on-screen preview.
- **History**: codes you download are saved locally in your browser (`localStorage`) so you can
  revisit, re-edit, or favorite them. Nothing is sent to a server.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and serve
- `npm run lint` — ESLint
- `npm run test` — unit tests (Vitest) for the QR encoding/validation logic

## Project structure

```
app/            Next.js App Router entry (page.js, layout.js)
components/qr/  UI: type selector, per-type forms, preview, customization, download, history
lib/            Encoding/validation per QR type, export (PNG/JPEG/SVG), history storage, state
```

## Tech

Next.js 16, React 18, Tailwind CSS, Material Tailwind, `qrcode` / `next-qrcode`.
