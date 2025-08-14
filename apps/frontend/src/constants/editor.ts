export const NOTION_STYLES = `
  .bn-container {
    height: 100% !important;
    overflow: hidden !important;
  }
  .bn-editor {
    height: 100% !important;
    min-height: 100% !important;
    padding: 2rem !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
  .ProseMirror {
    min-height: calc(100vh - 160px) !important;
    padding-bottom: 50vh !important;
  }
`;

export const KEYBOARD_SHORTCUTS = {
  SAVE: "s",
  FOCUS_MODE: "k",
  FULLSCREEN: "f",
  ESCAPE: "Escape",
} as const;

export const FOCUS_MODES = {
  NORMAL: "normal",
  APP: "app",
  BROWSER: "browser",
} as const;
