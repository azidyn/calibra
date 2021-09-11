<template>
  
    <div>
        <Title :text="`Imbalance (${Object.keys(this.connections.inputs).length})`"></Title>
        <!-- {{ multi }} -->
    </div>

</template>


<script>

import Title from './common/Title.vue';
import { Connection } from './mixins/Connection';

const Settings = {
    ports: {
        input: ['Orderbook', 'Aggregatebook'],
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

            const snapshot = data.snapshot;

            if ( !snapshot || !snapshot.bid || !snapshot.ask )
                return;
        
            const bid = snapshot.bid.reduce( (a,c ) => a + c[1], 0 )
            const ask = snapshot.ask.reduce( (a,c ) => a + c[1], 0 )

            const sum = bid + ask;

            if ( sum ) 
                this.$set( this.multi, data.sourceId, { bid: bid / sum , ask: ask / sum, asset: data.asset } );

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

        console.log(`imbalance listening -- ${this.id}:snapshot`);
        $mitt.on( `${this.id}:snapshot`, this.update );

    },


    settings() {
        return Settings;
    }

}
</script>

<style>

</style>