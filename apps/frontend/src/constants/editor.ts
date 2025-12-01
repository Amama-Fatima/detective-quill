export const NOTION_STYLES = `
  .bn-container {
    height: 100% !important;
    overflow: hidden !important;
    background-color: oklch(75.366% 0.04502 87.964) !important;
  }
  .bn-editor {
    height: 100% !important;
    min-height: 100% !important;
    padding: 2rem !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    background-color: oklch(75.366% 0.04502 87.964) !important;
  }
  .ProseMirror {
    min-height: calc(100vh - 160px) !important;
    padding-bottom: 50vh !important;
    background-color: oklch(75.366% 0.04502 87.964) !important;
  }
  .bn-suggestion-menu {
    background-color: oklch(75.366% 0.04502 87.964) !important;
  }
  .bn-suggestion-menu-item {
    background-color: oklch(0.8 0.04 91.59) !important;
  }
  .bn-suggestion-menu-item[data-selected="true"] {
    background-color: oklch(0.22 0.01 30) !important;
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
