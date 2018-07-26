import { Vue } from './lib/simple-vue';

const PAGE_SIZE = 20;
const template = `
<div>
    <div class="w-100 pos-relative filter">
        <div class="d-flex">
            <div class="flex-grow">
                <input v-model="filter" class="search w-100" type="text" placeholder="Filter"/>
                <svg class="clear-filter" v-if="filter" v-on:click="filter = ''" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="612px" height="612px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve"><path d="M306,0C137.012,0,0,136.992,0,306s137.012,306,306,306c168.988,0,306-136.992,306-306S474.988,0,306,0z M306,535.5      C179.45,535.5,76.5,432.55,76.5,306S179.45,76.5,306,76.5S535.5,179.45,535.5,306S432.55,535.5,306,535.5z M410.098,202.419      l-0.517-0.517c-14.19-14.19-37.218-14.19-51.408,0L306,254.076l-52.192-52.173c-14.191-14.191-37.198-14.191-51.408,0      l-0.517,0.516c-14.19,14.191-14.19,37.198,0,51.408L254.076,306l-52.192,52.192c-14.19,14.189-14.19,37.197,0,51.407      l0.517,0.517c14.191,14.19,37.217,14.19,51.408,0L306,357.925l52.173,52.191c14.19,14.19,37.198,14.19,51.408,0l0.517-0.517      c14.19-14.19,14.19-37.218,0-51.407L357.925,306l52.191-52.192C424.308,239.617,424.308,216.61,410.098,202.419z"></path></svg>
            </div>
            <div>
                <button :disabled="page === 0" v-on:click="previousPage()">Previous</button>
            </div>
            <div>
                <button v-on:click="nextPage()">Next</button>
            </div>
        </div>
    </div>
    <div class="data-table flex-grow">
        <table>
            <tr class="fields">
                <th class="pos-relative" v-for="field in fields" v-on:click="onSortColumn(field.name)" v-bind:style="{'min-width': field.width + 'px', 'max-width': field.width + 'px'}">
                    {{ field.name }}
                    <div class="arrow" v-if="field.name === sortColumn">
                        <div v-bind:class="{ asc: sortDirection === 'asc', desc: sortDirection === 'desc' }">
                        </div>
                    </div>
                </th>
            </tr>
            <tr v-for="row in rows">
                <td v-for="value in row">
                    {{ value }}
                </td>
            </tr>
        </table>
    </div>
</div>
`;

Vue.component('data-tab', {
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

        updateData() {
            let query = this.client.select()
                .from(this.selectedTable)
                .limit(PAGE_SIZE)
                .offset(this.page * PAGE_SIZE);
    
            if (this.sortColumn) {
                query = query.orderBy(this.sortColumn, this.sortDirection);
            }
    
            query.then((results) => {
                if (!results || results.length === 0) {
                    return;
                }
    
                this.fields = Object.keys(results[0]).map((key) => ({
                    name: key,
                    width: 100
                }));
                
                this.rows = results;
            });
        },
    
        previousPage() {
            if (this.page > 0) {
                this.page -= 1;
                this.updateData();
            }
        },
    
        nextPage() {
            this.page += 1;
            this.updateData();
        },
    
        selectTable(table:string) {
            this.sortColumn = null;
            this.sortDirection = null;
            this.selectedTable = table;
            this.page = 0;
            this.rows = [];
            this.fields = [];
            this.updateData();
        },

        onSortColumn(sortColumn:string) {
            this.page = 0;

            if (this.sortColumn === sortColumn) {
                this.sortDirection = (this.sortDirection === 'asc') ? 'desc' : 'asc';
            } else {
                this.sortColumn = sortColumn;
                this.sortDirection = 'asc';
            }

            this.updateData()
        },
    },

    data: () => ({
        page: 0,
        filter: '',
        rows: [],
        fields: [],
        sortColumn: null,
        sortDirection: null,
    }),

    template
});
