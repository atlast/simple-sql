import { Vue } from '../lib/simple-vue';


// TODO figure out how to move this to separate syntax highlighting file
const template = `
<div>
    <div class="pad-small" style="flex: 0 0 200px;">
        <textarea v-model="filter" placeholder="Enter query here..." class="w-100 h-100" style="resize: none;"></textarea>
    </div>
    <div class="text-right pad-small">
        <button :disabled="filter === ''" v-on:click="runQuery()">Run Query</button>
    </div>
    <div class="data-table flex-grow">
        <data-table v-bind:rows="rows" v-bind:canSort="false"></data-table>
    </div>
</div>
`;

Vue.component('query-tab', {
    props: [
        'client'
    ],

    methods: {
        runQuery() {
            this.client.raw(this.filter)
                .then((results) => {
                    if (results.command === 'SELECT') {
                        if (results.rowCount > 0) {
                            this.rows = results.rows;
                        } else {
                            this.rows = [
                                {
                                    'response': 'No results found.'
                                }
                            ];
                        }
                    } else {
                        this.rows = [
                            {
                                'response': `${results.command} - ${results.rowCount} records.`
                            }
                        ];
                    }                    
                }, (err) => {
                    this.rows = [
                        {
                            'error': err.message
                        }
                    ];
                });
        },
    },

    data: () => ({
        rows: [],
        filter: '',
    }),

    template
});
