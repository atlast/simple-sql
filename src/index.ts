import { Vue } from './lib/simple-vue';
import * as path from 'path';
import { remote } from 'electron';
import { Database } from './lib/database';

const defaultWindow = {
    height: 400,
    width: 400,
    // modal: true,
    // resizable: false,
}


new Vue({
    el: '#app',

    data: {
        filter: '',
        databases: remote.getGlobal('databases'),
        win: null
    },

    computed: {
        filtered() {
            const regex = new RegExp(this.filter, 'i');
            return this.databases.filter((database: Database) => {
                return database.name.match(regex) || database.host.match(regex);
            });
        }
    },

    methods: {
        add() {
            this.$openWindow({
                window: {
                    title: 'Add Connection',
                    ...defaultWindow
                },
                isChild: true,
                loadFile: path.join(__dirname, '../src/connection.html'),                
                setMenu: null
            });
        },

        edit(database: Database) {
            this.$openWindow({
                window: {
                    title: 'Edit Connection',
                    ...defaultWindow
                },
                isChild: true,
                loadFile: path.join(__dirname, '../src/connection.html'),                
                setMenu: null,
                data: {
                    database
                }
            });
        },

        connect(database: Database) {
            this.$openWindow({
                window: {
                    height: 680,
                    width: 1000,
                    title: database.name
                },
                loadFile: path.join(__dirname, '../src/query.html'),
                data: {
                    database
                }
            });
        },

        clearFilter() {
            this.filter = '';
        },

        onDataChange() {
            this.databases = remote.getGlobal('databases');
        }
    }
});