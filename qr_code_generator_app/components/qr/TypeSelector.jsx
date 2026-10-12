"use client";

import { useEffect, useRef } from "react";
import {
  LinkIcon,
  DocumentTextIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  EnvelopeIcon,
  WifiIcon,
  IdentificationIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/solid";
import { qrTypeOrder, qrTypes } from "@/lib/qrTypes";

const iconsByType = {
  url: LinkIcon,
  text: DocumentTextIcon,
  phone: PhoneIcon,
  sms: ChatBubbleLeftIcon,
  email: EnvelopeIcon,
  wifi: WifiIcon,
  vcard: IdentificationIcon,
  whatsapp: ChatBubbleOvalLeftEllipsisIcon,
  upi: CurrencyRupeeIcon,
};

export default function TypeSelector({ activeType, onChange }) {
  const buttonRefs = useRef([]);

  // The strip scrolls horizontally below `sm`, so picking a tab further along the
  // list (e.g. UPI) can otherwise leave the visible slice showing earlier tabs with
  // no on-screen indication of which one is actually active.
  useEffect(() => {
    const activeIndex = qrTypeOrder.indexOf(activeType);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    buttonRefs.current[activeIndex]?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [activeType]);

  function handleKeyDown(event, index) {
    const direction = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (event.key !== "Home" && event.key !== "End" && !direction) return;

    event.preventDefault();
    const lastIndex = qrTypeOrder.length - 1;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? lastIndex
          : (index + direction + qrTypeOrder.length) % qrTypeOrder.length;

    buttonRefs.current[nextIndex]?.focus();
    onChange(qrTypeOrder[nextIndex]);
  }

  return (
    <div
      role="tablist"
      aria-label="QR code type"
      className="flex gap-1 overflow-x-auto [scrollbar-width:none] -mx-4 px-4 w-full sm:w-auto sm:mx-0 sm:justify-center sm:flex-wrap
        [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] sm:[mask-image:none]"
    >
      {qrTypeOrder.map((typeId, index) => {
        const Icon = iconsByType[typeId];
        const isActive = activeType === typeId;
        return (
          <button
            key={typeId}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${typeId}`}
            aria-controls="qr-form-panel"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(typeId)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`shrink-0 snap-start flex items-center gap-2 min-h-11 px-3 rounded-full text-sm font-medium whitespace-nowrap
              transition-colors duration-200
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
              ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800"
              }`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            {qrTypes[typeId].label}
          </button>
        );
      })}
    </div>
  );
}
