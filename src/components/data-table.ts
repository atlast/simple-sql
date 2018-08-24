import { Vue } from '../lib/simple-vue';

interface Field {
    name: string;
    width: number
}

// TODO figure out how to move this to separate syntax highlighting file
const template = `
<table v-on:mousemove="onMouseMove" v-on:mouseup="onMouseUp"  v-on:mousedown="onGlobalMouseDown">
    <tr class="fields">
        <th class="pos-relative" v-for="field in fields" v-on:click="onSortColumn(field.name)" v-bind:style="{'min-width': field.width + 'px', 'max-width': field.width + 'px'}">
            {{ field.name }}
            <div class="arrow" v-if="field.name === sortColumn">
                <div v-bind:class="{ asc: sortDirection === 'asc', desc: sortDirection === 'desc' }">
                </div>
            </div>

            <div class="resizer" v-on:mousedown="onMouseDown(field)">I</div>
        </th>
    </tr>
    <tr v-for="row in rows">
        <td v-for="value in row">
            {{ value }}
        </td>
    </tr>
</table>
`;

Vue.component('data-table', {
    props: [
        'rows'
    ],

    watch: {
        rows: function(rows) {
            if (Array.isArray(rows) && rows.length > 0) {
                const newKeys = Object.keys(rows[0]);
                if (JSON.stringify(this.keys) !== JSON.stringify(newKeys)) {
                    this.sortColumn = null;
                    this.sortDirection = null;
                    this.keys = newKeys;
                    this.fields = newKeys.map((key) => ({
                        name: key,
                        width: 100
                    }));
                }
            } else {
                this.sortColumn = null;
                this.sortDirection = null;
                this.keys = null;
                this.fields = [];
            }
        },
    },

    methods: {
        onSortColumn(sortColumn: string) {
            if (this.didDrag) {
                return;
            }

            if (this.sortColumn === sortColumn) {
                this.sortDirection = (this.sortDirection === 'asc') ? 'desc' : 'asc';
            } else {
                this.sortColumn = sortColumn;
                this.sortDirection = 'asc';
            }

            this.$emit('sort', this.sortColumn, this.sortDirection);
        },

        onGlobalMouseDown() {
            this.didDrag = false;
        },

        onMouseDown(selectedField: Field) {
            this.selectedField = selectedField;
            this.isMouseDown = true
        },
    
        onMouseUp() {
            this.selectedField = null;
            this.isMouseDown = false;
        },
    
        onMouseMove(event: MouseEvent) {
            if (this.isMouseDown) {
                this.didDrag = true;
                this.selectedField.width += event.movementX;
            }
        },
    },

    data: () => ({
        keys: [],
        fields: <Field[]>[],
        sortColumn: null,
        sortDirection: null,
        isMouseDown: false,
        didDrag: false,
        selectedFile: <Field>null
    }),

    template
});
