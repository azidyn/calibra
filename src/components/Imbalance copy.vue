<template>
  
    <div>
        <Title :text="`Imbalance: ${inputs}`"></Title>
        <div v-if="inputs > 0">
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

    props: ['config', 'size', 'id', 'outputs', 'inputs'],

    components: { Title },

    data() {
        return { 
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


        accept( contract ) {
            return { success: Settings.ports.input.includes( contract.output ) };
        },

        disconnected( contract ) {
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