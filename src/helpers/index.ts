import { ILocalStorageParams, IOptions } from "./types";

export function ready(fn: () => void) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

const defaultOptions: IOptions = {
  attrComma: false,
  bodyLess: false,
  classesAtEnd: false,
  doubleQuotes: true,
  encode: true,
  indent: "spaces",
  inlineCSS: true,
  nSpaces: 2,
  parser: "html",
  save: false,
  attrWrapper: "square",
};

export const collectOptions = (form: HTMLFormElement) => ({
  ...defaultOptions,
  ...Object.fromEntries(
    Array.from(new FormData(form).entries()).map(([key, value]) => [
      key,
      value === "on" ? true : value,
    ])
  ),
});

const KEY_STORE = "html2slim_params";

export function saveToStorage(data: ILocalStorageParams) {
  window.localStorage.setItem(KEY_STORE, JSON.stringify(data));
}

export function getFromStorage(): ILocalStorageParams | null {
  const data = window.localStorage.getItem(KEY_STORE);
  if (!data) return null;
  return JSON.parse(data);
}

export function setParamsFromStorage(
  form: HTMLFormElement,
  params: ILocalStorageParams
) {
  Object.entries(params.options).forEach(([key, value]) => {
    const el = form.elements.namedItem(key);

    if (!el) return;

    if (el instanceof HTMLInputElement && typeof value === "boolean") {
      el.checked = value;
    }
    if (el instanceof RadioNodeList && typeof value === "string") {
      el.value = value;
    }
    if (el instanceof HTMLSelectElement && typeof value === "string") {
      el.value = value;
    }
    if (el instanceof HTMLInputElement && typeof value === "number") {
      el.value = `${value}`;
    }
  });
}
