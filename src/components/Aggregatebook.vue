<template>
    <div>
        <Title :text="`Aggregate ${assetstitle}`"/>
        <div>
            <div v-for="(bid, index) in megabook" :key="index">
                {{ bid }}
                <!-- {{ bid[0] }} => {{ bid[1] }} -->
            </div>
    
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


import Title    from './common/Title.vue';
import Book     from '../lob';
import util     from '../util/util';


export default {    

    props: ['config', 'size', 'id', 'outputs', 'inputs'],

    components: { Title },

    data() {
        return {
            socket: null,

            counter: 0,

            frequency: 500,

            snapshots: {},

            timer: null,

            // orderbooks: {
            //     /* 'bitmex:XBTUSD': { bid: [], ask: [] }   */
            // },

            assets: [],

            // aggregate: 0.5,
            levels: 20,

            bid: [],
            ask: [],


            mega: null

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

    computed: {

        megabook () {

            return this.mega ? this.mega.snapshot( this.levels ).bid : [];

        },

        tick() {
            return 5;
            return Math.max( ...this.assets.map( m => m.price.tick ) );
        },

        dp() {
            return 0
        },

        assetstitle() {
            return this.assets.map( m => m.symbol ).join(',');
        }


    },

    methods: {

        update( data ) {

            // $print('update, tick', this.tick )
            
            const id = data.asset.identifier();
            const atick = data.asset.price.tick;
            const dp = data.asset.price.dp;

            const levs = this.numlevels( atick );
            
            const quote = data.orderbook.quote();

            const maxbid = quote.bid - ( levs * atick );
            const maxask = quote.ask + ( levs * atick );

            // const snapshot = data.orderbook.snapshot( levs, maxbid, maxask );

            this.snapshots[ id ] = { native: atick, dp, snapshot: data.orderbook.snapshot( levs, maxbid, maxask ) };

            this.merge();
            
            // this.orderbooks[ data.asset.identifier() ] = data.orderbook;
            // Vue.set( this.orderbooks, data.asset.identifier(), data.orderbook );
            // console.log( this.orderbooks )

        },

        merge() {

            if ( !this.mega )
                this.mega = new Book();
            else
                this.mega.reset();

            for ( const id in this.snapshots ) {

                const book = this.snapshots[ id ].snapshot;

                // Bids
                let t =0, bids = book.bid, asks = book.ask;
                let mprice = 0;
                let bid, ask;
                const T = this.tick;
                const DP = this.dp;

                for ( t=0; t<bids.length; t++ ) {

                    bid = bids[t];
                    mprice = util.round_to_tick( bid[0], T,  DP );

                    this.mega.deltabid( mprice, bid[1] );

                }

            }

        },

        numlevels( atick ) {

            return this.tick / atick * this.levels;

        },


        notify() {

            // for ( const L of this.outputs ) 
            //     $mitt.emit(L, { orderbook: this.snapshot } );

        },

        accept( contract ) {

            if ( !Settings.ports.input.includes( contract.output ) ) 
                return false;
            
            const asset = contract.asset;

            if ( this.assets.length == 0 ) {
                this.assets.push( asset );
                return { success: true };
            }

            for ( const A of this.assets ) {
                if ( A.same( asset ) ) 
                    return { success: false, message: `Symbol already included in this aggregate book`};

                if ( !A.compatible( asset ) ) 
                    return { success: false, message: `Symbol ${asset.symbol} doesn't match this orderbook`};
            }

            this.assets.push( asset );

            return { success: true }

          },

        disconnected( contract ) {

            this.assets = this.assets.filter( f => !f.same( contract.asset ) );

            delete this.snapshots[ contract.asset.identifier() ];

        },

        contract() {
            return {
                input: Settings.ports.input,
                output: Settings.ports.output,
                assets: this.assets,
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