import { Vue } from './lib/simple-vue';
import { listTables } from './lib/database';
import { remote } from 'electron';
import Knex from 'knex';
const keytar = require('keytar');

new Vue({
    el: '#app',

    data: {
        client: null,

        selectedTable: null,
        selectedTab: 'data',
        isMouseDown: false,
        tableWidth: 200,
        database: {},
        tables: [],
    },

    methods: {
        onSetData(data:any) {
            this.database = data.database;
            keytar.getPassword('simple-sql', this.database.uuid)
                .then((password:string) => {
                    this.database.password = password;

                    this.client = Knex({
                        client: this.database.type,
                        connection: {
                            host: this.database.host,
                            port: this.database.port, 
                            user: this.database.username,
                            password: this.database.password,
                            database: this.database.database
                        }
                    });
        
                    listTables(this.client)
                        .then((tables) => {
                            tables.sort();
                            this.tables = tables;
                            if (this.tables.length > 0) {
                                this.selectTable(this.tables[0]);
                            }
                        }, (error) => {
                            remote.dialog.showErrorBox('Unable to get the tables from the database', error.message);
                        });
                });
        },
    
        selectTable(table:string) {
            this.selectedTable = table;
        },

        onMouseDown() {
            this.isMouseDown = true
        },

        onMouseUp() {
            this.isMouseDown = false;
        },

        onMouseMove(event: MouseEvent) {
            if (this.isMouseDown) {
                this.tableWidth = event.clientX - 5;
            }
        }
    }
});