<template>
  
    <div>
        <Title :text="`Imbalance (${Object.keys(this.inputs).length})`"></Title>
        inputs:
        {{ ainputs}}
        <br/>
        outputs:
        {{ aoutputs }}
        <!-- {{ assets }}
        <div v-if="assets.length > 0">
            {{ balance }}
        </div>
        <div v-else>
            Connect an orderbook!
        </div> -->
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
            assets: [],
            data: null,
            total: {
                bid: 0,
                ask: 0
            }
        }
    },

    computed: { 

        balance() {
            const sum = this.total.bid + this.total.ask;
            return { 
                bid: sum ? this.total.bid / sum : 0,
                ask: sum ? this.total.ask / sum : 0
            }
        }
    },

    methods: {

        update( data ) {

            this.data = data.snapshot;

            if ( !this.data )
                return;
            
            if ( this.data.bid ) this.total.bid = this.data.bid.reduce( (a,c ) => a + c[1], 0 );
            if ( this.data.ask ) this.total.ask = this.data.ask.reduce( (a,c ) => a + c[1], 0 );

        },

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

        $mitt.on( `${this.id}:snapshot`, this.update );
        $mitt.on( `${this.id}:config`, this.configure );

    },


    settings() {
        return Settings;
    }

}
</script>

<style>

</style>