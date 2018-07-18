import { Vue } from './lib/simple-vue';
import { Client } from 'pg';
const keytar = require('keytar');

let client:Client = null;

new Vue({
    el: '#app',

    data: {
        selectedTab: 'data',
        selectedTable: null,
        isMouseDown: false,
        tableWidth: 200,
        database: { },
        tables: []
    },

    methods: {
        selectTable(table:string) {
            this.selectedTable = table;
        },
       
        onSetData(data:any) {
            this.database = data.database;
            keytar.getPassword('simple-sql', this.database.uuid)
                .then((password:string) => {
                    this.database.password = password;

                    client = new Client({
                        user: this.database.username,
                        host: this.database.host,
                        database: this.database.database,
                        password: this.database.password,
                        port: this.database.port,
                    });

                    client.connect();
        
                    client.query("SELECT relname FROM pg_class WHERE relkind='r' AND relname !~ '^(pg_|sql_)' ORDER BY relname")
                        .then((results) => {
                            this.tables = results.rows.map((row) => row.relname);
                            if (this.tables.length > 0) {
                                this.selectTable(this.tables[0]);
                            }
                        });
                });            
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
        },

        onClose() {
            client.end();
        }
    }
});