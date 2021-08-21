<template>
  
    <div>
        <Title :text="`Imbalance: ${inputs}`"></Title>
        {{ assets.map( m => m.symbol) }}
        <div v-if="inputs.length > 0">
            {{ balance }}
        </div>
        <div v-else>
            Connect an orderbook!
        </div>
    </div>

</template>


<script>

import Title from './common/Title.vue';

const Settings = {
    ports: {
        input: ['Orderbook'],
        output: 'TimeSeries'
    },
    connections: 1
};

export default {

    props: ['config', 'size', 'id', 'outputs' ],

    components: { Title },

    data() {
        return { 
            inputs: [],
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
                return false;
            
            const asset = contract.asset;

            // This is a blank, fresh orderbook always return true
            if ( this.assets.length == 0 )
                return { success: true };

            for ( const A of this.assets ) {
                if ( A.same( asset ) ) 
                    return { success: false, warning: `Symbol already included in this aggregate book`};

                if ( !A.compatible( asset ) ) 
                    return { success: false, error: `Symbol ${asset.symbol} doesn't match this orderbook`};
            }


            return { success: true }            
        },

        connect( source_id, contract ) {

            const asset = contract.asset;
            this.assets.push( asset );

        },

        disconnect( source_id, contract ) {

            this.assets = this.assets.filter( f => !f.same( contract.asset ) );
            // this.inputs = this.inputs.filter( f => f != source_id );

        },

        contract() {

            return Settings.ports;

        }

    },

    mounted() {

        $mitt.on( `${this.id}:snapshot`, this.update );

    },


    // accept( component ) {

    //     if ( Settings.ports.input.includes( component.settings().ports.output ) ) {
    //         $print('accepted')
    //         return true;
    //     }

    //     $print('failed', component.settings().ports, Settings.ports.input )
    //     return false;

    // },

    settings() {
        return Settings;
    }

}
</script>

<style>

</style>