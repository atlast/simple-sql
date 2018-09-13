import { Vue } from '../lib/simple-vue';
import { remote } from 'electron';


// TODO figure out how to move this to separate syntax highlighting file
const template = `
<div class="pad-small">
    <div class="data-table flex-grow">
        <data-table v-bind:rows="rows" v-bind:canSort="false"></data-table>
    </div>
</div>
`;

Vue.component('details-tab', {
    props: [
        'client',
        'selected-table'
    ],

    watch: {
        selectedTable: function(table) {
            this.selectTable(table);
        },
    },

    methods: {    
        selectTable(table:string) {
            this.client(table).columnInfo().then((response) => {
                this.rows = [];

                Object.keys(response).forEach((key) => {
                    const row = {
                        'column': key
                    };

                    Object.keys(response[key]).forEach((subKey) => {
                        row[subKey] = response[key][subKey];
                    });

                    this.rows.push(row);
                });
            });
        },
    },

    data: () => ({
        rows: [],
    }),

    template
});
