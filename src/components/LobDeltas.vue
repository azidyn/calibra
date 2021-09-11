<template>
  
    <div>
        <Title :text="`Cumm. Delta Balance (${Object.keys(this.connections.inputs).length})`"></Title>
        <!-- {{ multi }} -->
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

            const deltas = data.deltas;

            if ( !deltas || !deltas.length )
                return;

            // Get the current data
            const m = this.multi[ data.sourceId ];

            // Get the current asset id
            const identifier = m.asset ? m.asset.identifier : '';

            let bid = m.bid;
            let ask = m.ask;

            // If the source switched to a different asset or this
            // is a new connection, reset counters
            if ( identifier != data.asset.identifier ) {
                bid = 0; 
                ask = 0;
            }

            for ( const delta of deltas )  {

                if ( delta[2] == 0 )
                    bid += delta[1];
                else
                    ask += delta[1];

            }

            const sum = Math.abs( bid ) + Math.abs( ask );
       
            this.$set( this.multi, data.sourceId, { bid, ask, balance: { bid: sum ? bid / sum : 0, ask: sum ? ask/sum : 0 }, asset: data.asset } );


        },


        /* Set up our data */
        input( opts ) {

            const id = opts.sourceId;
            this.$set( this.multi, id, { bid: 0, ask: 0, asset:null } );

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