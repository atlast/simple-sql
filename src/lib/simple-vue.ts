const Vue = require('../../node_modules/vue/dist/vue.common');
import { remote, BrowserWindow, ipcRenderer } from 'electron';
import { WindowOptions } from './window';

let parent:BrowserWindow = null;
let app:any = null; // TODO fix typing

Vue.prototype.$openWindow = (options: WindowOptions) => {
    if (options.isChild) {
        options.window = {
            parent,
            ...options.window
        };
    }
    // Create the browser window.
    let child = new remote.BrowserWindow({
        height: 600,
        width: 1200,
        icon: './assets/images/icon/icon.png',
        ...options.window
    });

    // and load the html of the app.
    child.loadFile(options.loadFile);

    // Open the DevTools.
    if (options.showDevTools) {
        child.webContents.openDevTools();
    }

    if (options.setMenu !== undefined) {
        child.setMenu(options.setMenu);
    }

    if (options.data) {
        child.webContents.once('did-finish-load', () => {
            // Send Message
            child.webContents.send('setData', options.data);
        });
    }

    // Emitted when the window is closed.
    child.on('closed', () => {
        // Dereference the window object
        if (app.onClose !== undefined) {
            app.onClose();
        }
        child = null;
    });
};

Vue.mixin({
    beforeCreate() {
        if (this.constructor.name === 'Vue') {
            parent = remote.getCurrentWindow();
            if (app !== null) {
                throw 'Vue app already declared. This will probably cause issues';
            } else {
                app = this;
            }
        }
    }
});

ipcRenderer.on('dataChanged', () => {
    if (app.onDataChange !== undefined) {
        app.onDataChange();
    }
});

ipcRenderer.on('setData', (event: Event, data: any) => {
    if (app.onSetData !== undefined) {
        app.onSetData(data);
    } else {
        for (var key in data) {
            if (!data.hasOwnProperty(key)) continue;
            app[key] = data[key];
        }
    }
});

export {
    Vue
};