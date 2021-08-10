<template>
    <div>
        <Title :text="`lob ${id}`"/>
        <div>
            {{ snapshot }}
        </div>
    </div>
</template>

<script>

const Ports = {
    input: [],
    output: 'Orderbook'
}


import Title from './common/Title.vue';


export default {    

    props: ['config', 'size', 'id', 'listeners'],

    components: { Title },

    data() {
        return {
            socket: null,
            // emitter: mitt(),
            counter: 0,

            frequency: 500,

            snapshot: null,

            timer: null
        }
    },

    computed: {
        symbol() {
            return this.config.symbol;
        },
        exchange() {
            return this.config.exchange;
        }
    },


    methods: {

        update( data ) {
            this.snapshot = data.orderbook.snapshot( 3 );
        },


        notify() {

            for ( const L of this.listeners ) 
                $mitt.emit(L, { orderbook: this.snapshot } );

        }


    },

    mounted() {

        if ( this.timer )
            clearInterval( this.timer );

        this.timer = setInterval( () => this.notify() , this.frequency)

        this.socket = $network.socket( this.exchange );
        this.socket.on(`orderbook:${this.symbol}`, this.update, this );
        this.socket.orderbook( this.symbol );        

    },

    beforeDestroy() {
        if ( this.timer )
            clearInterval( this.timer );

        this.timer = null;
    },


    accept( component ) {
        return false;
    },

    ports() {
        return Ports;
    },

    test: {
        whatever: 123,
        hello: 'String guy'
    }

}
</script>

<style>

</style>