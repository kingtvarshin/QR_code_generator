"use client";

import { useReducer } from "react";
import { getDefaultFieldsByType, qrTypeOrder } from "./qrTypes";

export const defaultOptions = {
  errorCorrectionLevel: "M",
  margin: 4,
  width: 240,
  colorDark: "#000000",
  colorLight: "#ffffff",
};

export function createInitialState() {
  return {
    activeType: qrTypeOrder[0],
    fields: getDefaultFieldsByType(),
    options: { ...defaultOptions },
    logo: null, // { dataUrl, width } | null
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_ACTIVE_TYPE":
      return { ...state, activeType: action.typeId };

    case "SET_FIELD":
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.typeId]: {
            ...state.fields[action.typeId],
            [action.field]: action.value,
          },
        },
      };

    case "SET_OPTION":
      return { ...state, options: { ...state.options, [action.key]: action.value } };

    case "SET_LOGO":
      return { ...state, logo: action.logo };

    case "CLEAR_LOGO":
      return { ...state, logo: null };

    case "LOAD_STATE":
      return {
        activeType: action.state.activeType,
        fields: { ...getDefaultFieldsByType(), ...action.state.fields },
        options: { ...defaultOptions, ...action.state.options },
        logo: action.state.logo ?? null,
      };

    case "RESET":
      return createInitialState();

    default:
      return state;
  }
}

export function useQrBuilder() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  return [state, dispatch];
}
