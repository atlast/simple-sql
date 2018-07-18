import { app, BrowserWindow, BrowserWindowConstructorOptions, ipcMain, Menu, ipcRenderer } from 'electron';
import { WindowOptions } from './lib/window';
import * as path from 'path';
import Store from 'electron-store';
const keytar = require('keytar');
const uuidv4 = require('uuid/v4');


const store = new Store();
const globalAny:any = global;
const windows: BrowserWindow[] = [];

globalAny.databases = store.get('databases') || [];

function dataChanged() {
    BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('dataChanged');
    });
}

ipcMain.on('openWindow', (event: Event, options: WindowOptions) => {
    createWindow(options);
});

ipcMain.on('editDatabase', (event: Event, database: any) => {
    const password = database.password;
    delete database.password;

    if (!database.uuid) {
        database.uuid = uuidv4();
        globalAny.databases.push(database);
    } else {
        const index = globalAny.databases.findIndex((item: any) => {
            return database.uuid === item.uuid;
        });

        globalAny.databases[index] = database;
    }

    if (password) {
        keytar.setPassword('simple-sql', database.uuid, password);
    } else {
        keytar.deletePassword('simple-sql', database.uuid, password);
    }

    store.set('databases', globalAny.databases);

    dataChanged();
});

ipcMain.on('removeDatabase', (event: Event, database: any) => {
    keytar.deletePassword('simple-sql', database.uuid);

    globalAny.databases = globalAny.databases.filter((item: any) => {
        return item.uuid !== database.uuid;
    });
    store.set('databases', globalAny.databases);
    dataChanged();
});

function createWindow(options: WindowOptions) {
    // Create the browser window.
    let win = new BrowserWindow({
        height: 600,
        width: 1200,
        ...options.window
    });

    // and load the html of the app.
    win.loadFile(options.loadFile);

    // Open the DevTools.
    if (options.showDevTools) {
        win.webContents.openDevTools();
    }

    if (options.setMenu !== undefined) {
        win.setMenu(options.setMenu);
    }

    if (options.data) {
        win.webContents.once('did-finish-load', () => {
            // Send Message
            win.webContents.send('setData', options.data);
        });
    }

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object
        const index = windows.indexOf(win);
        windows.splice(index, 1);
    });

    windows.push(win);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow({
        loadFile: path.join(__dirname, '../src/index.html')
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windows.length === 0) {
        createWindow({
            loadFile: path.join(__dirname, '../src/index.html')
        });
    }
});
