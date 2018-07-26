import { Vue } from './lib/simple-vue';
import { BrowserWindow, remote, ipcRenderer } from 'electron';
import { testConnection } from './lib/database';
import Knex from 'knex';
const keytar = require('keytar');


let win: BrowserWindow;

const app = new Vue({
    el: '#app',
    data: {
        isEditMode: false,
        tested: false,
        database: {
            uuid: null,
            name: '',
            host: '',
            port: '',
            username: '',
            password: '',
            database: '',
            type: ''
        },
    },
    methods: {
        cancel() {
            win.close();
        },

        remove() {
            remote.dialog.showMessageBox({
                type: 'question',
                title: 'Are you sure?',
                message: 'Are you sure you wish to delete this connection?',
                buttons: ['Cancel', 'Yes'],
                detail: 'Deleting this connection will permanently remove all information from this computer. This action cannot be undone.',
                cancelId: 0,
            }, (response) => {
                if (response === 1) {
                    ipcRenderer.send('removeDatabase', this.database);
                    win.close();
                }
            });
        },

        save() {
            ipcRenderer.send('editDatabase', this.database);
            win.close();
        },

        test() {
            const client = Knex({
                client: this.database.type,
                connection: {
                    host: this.database.host,
                    port: this.database.port, 
                    user: this.database.username,
                    password: this.database.password,
                    database: this.database.database
                }
            });

            testConnection(client)
                .then(() => {
                    this.tested = true;
                }, (error) => {
                    this.tested = false;
                    remote.dialog.showErrorBox('Unable to connect', error.message);
                });
        },

        onSetData(data:any) {
            for (var key in data) {
                if (!data.hasOwnProperty(key)) continue;
                this[key] = data[key];
            }

            this.tested = true;
            this.isEditMode = true;
            this.database.password = keytar.getPassword('simple-sql', this.database.uuid);
        }
    },

    beforeMount() {
        win = remote.getCurrentWindow();
    }
});