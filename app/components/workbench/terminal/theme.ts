import type { ITheme } from '@xterm/xterm';

const style = getComputedStyle(document.documentElement);
const cssVar = (token: string) => style.getPropertyValue(token) || undefined;

export function getTerminalTheme(overrides?: ITheme): ITheme {
  return {
    cursor: cssVar('--stackbird-elements-terminal-cursorColor'),
    cursorAccent: cssVar('--stackbird-elements-terminal-cursorColorAccent'),
    foreground: cssVar('--stackbird-elements-terminal-textColor'),
    background: cssVar('--stackbird-elements-terminal-backgroundColor'),
    selectionBackground: cssVar('--stackbird-elements-terminal-selection-backgroundColor'),
    selectionForeground: cssVar('--stackbird-elements-terminal-selection-textColor'),
    selectionInactiveBackground: cssVar('--stackbird-elements-terminal-selection-backgroundColorInactive'),

    // ansi escape code colors
    black: cssVar('--stackbird-elements-terminal-color-black'),
    red: cssVar('--stackbird-elements-terminal-color-red'),
    green: cssVar('--stackbird-elements-terminal-color-green'),
    yellow: cssVar('--stackbird-elements-terminal-color-yellow'),
    blue: cssVar('--stackbird-elements-terminal-color-blue'),
    magenta: cssVar('--stackbird-elements-terminal-color-magenta'),
    cyan: cssVar('--stackbird-elements-terminal-color-cyan'),
    white: cssVar('--stackbird-elements-terminal-color-white'),
    brightBlack: cssVar('--stackbird-elements-terminal-color-brightBlack'),
    brightRed: cssVar('--stackbird-elements-terminal-color-brightRed'),
    brightGreen: cssVar('--stackbird-elements-terminal-color-brightGreen'),
    brightYellow: cssVar('--stackbird-elements-terminal-color-brightYellow'),
    brightBlue: cssVar('--stackbird-elements-terminal-color-brightBlue'),
    brightMagenta: cssVar('--stackbird-elements-terminal-color-brightMagenta'),
    brightCyan: cssVar('--stackbird-elements-terminal-color-brightCyan'),
    brightWhite: cssVar('--stackbird-elements-terminal-color-brightWhite'),

    ...overrides,
  };
}
