<template>
  
    <div>
        <Title :text="`Imbalance ${id}`"></Title>
        <div>
            {{ balance }}
        </div>
    </div>

</template>


<script>

import Title from './common/Title.vue';

const Ports = {
    input: ['Orderbook'],
    output: 'TimeSeries'
};

export default {

    props: ['config', 'size', 'id'],

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

            this.data = data.orderbook;

            this.total.bid = this.data.bid.reduce( (a,c ) => a + c[1], 0 );
            this.total.ask = this.data.ask.reduce( (a,c ) => a + c[1], 0 );

        }

    },

    mounted() {

        $mitt.on( this.id, this.update );

    },


    accept( component ) {

        if ( Ports.input.includes( component.ports().output ) ) {
            $print('accepted')
            return true;
        }

        $print('failed', component.ports(), Ports.input )
        return false;

    },

    ports() {
        return Ports;
    }

}
</script>

<style>

</style>