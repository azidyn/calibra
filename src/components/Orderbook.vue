<template>
    <div>
        <Title :text="`${exchange}:${symbol}`"/>
        <div v-if="snapshot">
            <!-- {{ snapshot }} -->
            <div v-for="(bid, index) in snapshot.bid" :key="index">
                {{ bid }}
            </div>
        </div>
    </div>
</template>

<script>

const Settings = {
    ports: {
        input: [],
        output: 'Orderbook'
    },
    connections: 10
}


import Title from './common/Title.vue';
const Clone = o => o ? JSON.parse( JSON.stringify( o )) : null;

export default {    

    props: ['config', 'size', 'id', 'outputs', 'inputs'],

    components: { Title },

    data() {
        return {
            socket: null,
            // emitter: mitt(),
            counter: 0,

            frequency: 500,

            orderbook: null,
            snapshot: null,

            timer: null
        }
    },

    watch: {
        outputs: {

            immediate: true,
            deep: true,

            handler(n ,o ) {
                
                if ( this.outputs.length == 0 ) {

                    this.heartbeat( false );

                } else {

                    this.heartbeat( true );
                }
            }

        }
    },

    computed: {
        asset() {
            return this.config.asset;
        },
        symbol() {
            return this.asset.symbol;
        },
        exchange() {
            return this.asset.exchange;
        }
    },


    methods: {

        update( data ) {
            
            this.orderbook = data.orderbook;
            this.snapshot = data.orderbook.snapshot( 10 );
            this.heartbeat( true );

        },


        notify() {

            for ( const L of this.outputs )  {

                $mitt.emit(`${L}:snapshot`, { asset: this.asset, snapshot: this.snapshot } );
                $mitt.emit(`${L}:orderbook`, { asset: this.asset, orderbook: this.orderbook  } );

            }

        },

        heartbeat( start=true ) {

            if ( start ) {

                if ( this.timer )
                    return;
                
                this.timer = setInterval( () => this.notify() , this.frequency)                

                return;

            } else {

                if ( !this.timer )
                    return;

                clearInterval( this.timer );
                this.timer = null;

                return;
            }

        },

        accept( ) {
            return { success: false }
        },

        contract() {
            return {
                
                input: Settings.ports.input,
                output: Settings.ports.output,
                asset: this.asset

            }

        }



    },

    mounted() {
        // this.socket = $network.socket( this.exchange );
        // this.socket.on(`orderbook:${this.symbol}`, this.update, this );
        // this.socket.orderbook( this.symbol );        
    },

    beforeDestroy() {

        this.heartbeat( false );

    },


    // accept( component ) {
    //     return false;
    // },

    // settings() {
    //     return Settings;
    // },

    test: {
        whatever: 123,
        hello: 'String guy'
    }

}
</script>

<style>

</style>