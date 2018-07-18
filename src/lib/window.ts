import { BrowserWindow, BrowserWindowConstructorOptions, Menu } from 'electron';

export interface WindowOptions {
    window?: BrowserWindowConstructorOptions,
    loadFile: string,
    showDevTools?: boolean,
    parent?: BrowserWindow
    setMenu?: Menu,
    data?: any
    isChild?: boolean
}