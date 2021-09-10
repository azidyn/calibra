<template>
  
    <div>
        <Title :text="`LOB Deltas (${Object.keys(this.connections.inputs).length})`"></Title>
        {{ multi }}
    </div>

</template>


<script>

import Title from './common/Title.vue';
import { Connection } from './mixins/Connection';

const Settings = {
    ports: {
        input: ['Orderbook'],
        output: 'TimeSeries'
    },
    connections: 1
};

export default {

    mixins: [ Connection ],
    props: ['config', 'size', 'id' ],

    components: { Title },

    data() {
        return { 
            multi: {} 
        }
    },

    methods: {

        update( data ) {

            console.log( 'lobdeltas', data.deltas );

        },


        /* Set up our data */
        input( opts ) {

            const id = opts.sourceId;
            this.$set( this.multi, id, { bid: 0, ask: 0 } );

        },
       
        /* Clean up our data */
        xinput( sourceId ) {
            
            delete this.multi[ sourceId ];

        },

        /* Is the connecting archetype compatible? */
        verify( contract ) {

            if ( !Settings.ports.input.includes( contract.output ) ) 
                return { success: false, error: 'Input is not compatible' }

            return { success: true }
           
        },


        contract() {
            return Settings.ports;
        }

    },

    mounted() {

        $mitt.on( `${this.id}:orderbook:high`, this.update );

    },


    settings() {
        return Settings;
    }

}
</script>

<style>

</style>