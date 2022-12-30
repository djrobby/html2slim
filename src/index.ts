import "codemirror/mode/htmlmixed/htmlmixed.js";
import "codemirror/mode/slim/slim.js";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import { convert as xhtml2slim } from "xhtml2slim";

import {
  ready,
  getFromStorage,
  saveToStorage,
  setParamsFromStorage,
  collectOptions,
} from "./helpers";
import EXAMPLE_HTML from "./example.html?raw";
import { IOptions } from "./helpers/types";

const htmlContainer = document.querySelector("#html");
const slimContainer = document.querySelector("#slim");
const form = document.querySelector("form")!;

/**
 * @typedef Options
 * @type {object}
 * @prop {boolean} tabs
 * @prop {number} nspaces
 * @prop {boolean} bodyless
 * @prop {boolean} noattrcomma
 * @prop {boolean} donotencode
 * @prop {boolean} double
 */

const showHideCopyMessage = (
  copyBtn: HTMLElement,
  copyMsg: HTMLElement,
  message: string
) => {
  copyMsg.innerText = message;
  copyBtn.classList.add("hidden");
  copyMsg.classList.remove("hidden");

  setTimeout(() => {
    copyMsg.classList.add("hidden");
    copyBtn.classList.remove("hidden");
  }, 1500);
};

const copyContent = async (
  contentToCopy: string,
  copyBtn: HTMLElement,
  copyMsg: HTMLElement
) => {
  try {
    if (contentToCopy) {
      await navigator.clipboard.writeText(contentToCopy);
      showHideCopyMessage(copyBtn, copyMsg, "Content copied!");
    }
  } catch (err) {
    showHideCopyMessage(copyBtn, copyMsg, `Failed: ${err}`);
  }
};

ready(function () {
  if (!htmlContainer || !slimContainer) return;

  const restoredParams = getFromStorage();
  if (restoredParams) {
    setParamsFromStorage(form, restoredParams);
  }

  /**
   * Creating html editor
   * @type {CodeMirror.Editor}
   */
  const htmlEditor = CodeMirror(htmlContainer, {
    value: (restoredParams && restoredParams.html) || EXAMPLE_HTML,
    mode: "htmlmixed",
    lineNumbers: true,
    theme: "material",
  });

  htmlEditor.setSize("100%", "100%");

  /**
   * Creating slim editor
   * @type {CodeMirror.Editor}
   */
  const slimEditor = CodeMirror(slimContainer, {
    mode: "slim",
    lineNumbers: true,
    theme: "material",
  });

  slimEditor.setSize("100%", "100%");

  /**
   * Post text to api for convert html to slim
   * @param {string} html
   * @param {Options} options
   */
  function convert(
    html: string,
    { nSpaces, indent, attrWrapper, save, ...options }: Partial<IOptions>
  ) {
    try {
      const result = xhtml2slim(html, {
        ...options,
        symbol: indent === "tabs" ? "\t" : " ".repeat(nSpaces ?? 2),
        attrWrapper: attrWrapper,
      });
      slimEditor.setValue(result);
    } catch (err) {
      slimEditor.setValue((err as Error).message + "\n" + (err as Error).stack);
    }

    if (save) {
      saveToStorage({
        html,
        options: { ...options, nSpaces, indent, attrWrapper },
      });

      const saveCheckbox = document.querySelector("#save") as HTMLInputElement;
      saveCheckbox.checked = false;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const html = htmlEditor.getValue();
    const options = collectOptions(form);
    convert(html, options);
  });

  const copyBtn = document.getElementById("copyCode");
  const copyMsg = document.getElementById("copyCodeMessage");

  copyBtn?.addEventListener("click", () => {
    const slimEditorValue = slimEditor.getValue();
    copyContent(slimEditorValue, copyBtn, copyMsg!);
  });
});
