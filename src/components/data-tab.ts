import { Vue } from '../lib/simple-vue';
import { remote } from 'electron';

const PAGE_SIZE = 20;

// TODO figure out how to move this to separate syntax highlighting file
const template = `
<div>
    <div class="w-100 pos-relative filter">
        <div class="d-flex search">
            <div id="search-bar" class="flex-grow">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve"><path d="M29.283,25.749l-7.125-7.127c0.959-1.582,1.521-3.436,1.521-5.422c0-5.793-4.688-10.484-10.481-10.486  C7.409,2.716,2.717,7.407,2.717,13.199c0,5.788,4.693,10.479,10.484,10.479c1.987,0,3.838-0.562,5.42-1.521l7.129,7.129  L29.283,25.749z M6.716,13.199C6.722,9.617,9.619,6.72,13.2,6.714c3.58,0.008,6.478,2.903,6.484,6.485  c-0.007,3.579-2.904,6.478-6.484,6.483C9.618,19.677,6.721,16.778,6.716,13.199z"></path></svg>
                <input v-on:keyup.enter="search()" v-model="filter" class="search w-100" type="text" placeholder="Filter"/>
                <svg class="clear-filter" v-if="filter" v-on:click="clearSearch()" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="612px" height="612px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve"><path d="M306,0C137.012,0,0,136.992,0,306s137.012,306,306,306c168.988,0,306-136.992,306-306S474.988,0,306,0z M306,535.5      C179.45,535.5,76.5,432.55,76.5,306S179.45,76.5,306,76.5S535.5,179.45,535.5,306S432.55,535.5,306,535.5z M410.098,202.419      l-0.517-0.517c-14.19-14.19-37.218-14.19-51.408,0L306,254.076l-52.192-52.173c-14.191-14.191-37.198-14.191-51.408,0      l-0.517,0.516c-14.19,14.191-14.19,37.198,0,51.408L254.076,306l-52.192,52.192c-14.19,14.189-14.19,37.197,0,51.407      l0.517,0.517c14.191,14.19,37.217,14.19,51.408,0L306,357.925l52.173,52.191c14.19,14.19,37.198,14.19,51.408,0l0.517-0.517      c14.19-14.19,14.19-37.218,0-51.407L357.925,306l52.191-52.192C424.308,239.617,424.308,216.61,410.098,202.419z"></path></svg>
            </div>
            <div>
                <button :disabled="filter === ''" v-on:click="search()">Search</button>
            </div>
            <div>
                <button :disabled="page === 0" v-on:click="previousPage()">Previous</button>
            </div>
            <div>
                <button :disabled="page >= maxPage" v-on:click="nextPage()">Next</button>
            </div>
        </div>
    </div>
    <div class="data-table flex-grow">
        <data-table v-bind:rows="rows" v-on:sort="onSortColumn"></data-table>
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

            let countQuery = this.client.select()
                .from(this.selectedTable);
    
            if (this.sortColumn) {
                query = query.orderBy(this.sortColumn, this.sortDirection);
            }

            if (this.actualFilter) {
                query = query.whereRaw(this.actualFilter);
                countQuery = countQuery.whereRaw(this.actualFilter);
            }
    
            query.then((results) => {
                if (!results || results.length === 0) {
                    return;
                }
                
                this.rows = results;
            }, (error: Error) => {
                remote.dialog.showErrorBox('Query error', error.message);
            });

            countQuery.count('id as CNT').then((results) => {
                this.maxPage = Math.floor(1.0 * results[0].CNT / PAGE_SIZE);
            }, () => null);
        },

        // TODO also allow pressing enter key to search
        search() {
            this.actualFilter = this.filter;
            this.page = 0;
            this.maxPage = 0;
            this.updateData();
        },

        clearSearch() {
            this.filter = '';
            this.page = 0;
            this.maxPage = 0;
            this.search();
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
            this.maxPage = 0;
            this.rows = [];
            this.updateData();
        },

        onSortColumn(sortColumn:string, sortDirection:string) {
            this.page = 0;
            this.sortColumn = sortColumn;
            this.sortDirection = sortDirection;
            this.updateData()
        },
    },

    data: () => ({
        page: 0,
        maxPage: 0,
        filter: '',

        // This value is set with the filter value after the user presses "Search"
        // Is there a better way to do this?
        actualFilter: '',

        rows: [],
        sortColumn: null,
        sortDirection: null,
    }),

    template
});
