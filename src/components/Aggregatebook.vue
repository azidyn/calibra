<template>
    <div>
        <Title :text="`Aggregate ${id}`"/>
        <div>
            {{ symbols }}
        </div>
    </div>
</template>

<script>

const Settings = {
    ports: {
        input: ['Orderbook'],
        output: 'Aggregatebook'
    },
    connections: 10
}


import Title from './common/Title.vue';
import SYM from '../exchange/sym';

export default {    

    props: ['config', 'size', 'id', 'outputs', 'inputs'],

    components: { Title },

    data() {
        return {
            socket: null,

            counter: 0,

            frequency: 500,

            snapshot: null,

            timer: null,

            assets: []
        }
    },

    watch: {
        outputs(n, o ) {

            if ( this.outputs.length == 0 ) {

                this.heartbeat( false );

            } else {

                this.heartbeat( true );
            }

        }
    },



    methods: {

        update( data ) {
            
            // console.log( data );

            // this.snapshot = data.orderbook.snapshot( 3 );
            // this.heartbeat( true );

        },


        notify() {

            // for ( const L of this.outputs ) 
            //     $mitt.emit(L, { orderbook: this.snapshot } );

        },

        accept( contract ) {

            if ( !Settings.ports.input.includes( contract.output ) ) 
                return false;

            $print('adding: ', contract.asset )

            if ( this.symbols.length == 0 ) {
                this.symbols.push( add );
                return { success: true };
            }

            for ( const S of this.symbols ) {

                if ( this.duplicate( S, add ) ) 
                    return { success: false, message: `Symbol already included in this aggregate book`};

                if ( !this.compatible( S, add ) ) 
                    return { success: false, message: `Symbol ${contract.data.symbol} doesn't match this orderbook`};
            }

            this.symbols.push( add );

            return { success: true };

        },

        duplicate( sym1, sym2 ) {
            return sym1.symbol == sym2.symbol && sym1.exchange == sym2.exchange
        },
        compatible( sym1, sym2 ) {
            return sym1.normalized == sym2.normalized && sym1.market == sym2.market;
        },

        disconnected( contract ) {

            this.symbols = this.symbols.filter( f => f.symbol != contract.data.symbol && f.exchange != contract.data.exchange );

        },

        contract() {
            return {
                input: Settings.ports.input,
                output: Settings.ports.output,

                data: {
                    multi: true
                }
            }
        },

        

        heartbeat( start=true ) {

            return;
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


    },

    mounted() {
        // this.socket = $network.socket( this.exchange );
        // this.socket.on(`orderbook:${this.symbol}`, this.update, this );
        // this.socket.orderbook( this.symbol );        

        $mitt.on( `${this.id}:orderbook`, this.update );
        $mitt.on( `${this.id}:connection`, this.connection );

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