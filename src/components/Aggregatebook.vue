<template>
    <div>
        <Title :text="`Aggregate`"/>
        inputs:
        {{ ainputs }}
        <br/>
        outputs:
        {{ aoutputs }}        
        
        <!-- <div>
            {{ assets }}
            <div v-for="(bid, index) in megabook" :key="index" :style="stylebid( bid[0] )">
                {{ bid }}
            </div>
    
        </div> -->
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

import { Connection } from './mixins/Connection';

import Title    from './common/Title.vue';
import Book     from '../lob';
import util     from '../util/util';

export default {    

    mixins: [ Connection ],

    props: ['config', 'size', 'id'],

    components: { Title },

    data() {
        return {
            socket: null,

            frequency: 500,

            snapshots: {},

            timer: null,
       
            levels: 20,

            quotes: {
                bid: [],
                ask: []
            },

            mega: null,

            asset: null, // The normalized symbol for this aggregate book

            tick: 5      // Current tick level

        }
    },


    computed: {

        normalized() {
            return this.asset ? this.asset.normalized : null;
        },

        megabook () {

            return this.mega ? this.mega.snapshot( this.levels ).bid : [];

        },

        dp() {
            return 0
        },


    },

    methods: {

        update( data ) {

            if ( this.incompatible( data ) ) 
                return this.detatchsource( data.sourceId );

            if ( !data.orderbook )
                return;

            // Ensure tick matches the lowest resolution input
            this.tick = Math.max( this.tick, data.asset.price.tick );

            const id = data.asset.identifier();
            const atick = data.asset.price.tick;
            const dp = data.asset.price.dp;

            const levs = this.numlevels( atick );
            
            const quote = data.orderbook.quote();

            const maxbid = quote.bid - ( levs * atick );
            const maxask = quote.ask + ( levs * atick );

            // const snapshot = data.orderbook.snapshot( levs, maxbid, maxask );

            this.snapshots[ id ] = { asset: data.asset, snapshot: data.orderbook.snapshot( levs, maxbid, maxask ) };

            this.merge();
            
            // this.orderbooks[ data.asset.identifier() ] = data.orderbook;
            // Vue.set( this.orderbooks, data.asset.identifier(), data.orderbook );
            // console.log( this.orderbooks )

        },

        merge() {

            if ( !this.mega )
                this.mega = new Book({ shadow: false });
            else
                this.mega.reset();

            this.quotes.bid = [];

            for ( const id in this.snapshots ) {

                const book = this.snapshots[ id ].snapshot;
                const asset = this.snapshots[ id ].asset;

                // Bids
                let t =0, bids = book.bid, asks = book.ask;
                let mprice = 0;
                let bid, ask;
                const T = this.tick;
                const DP = this.dp;

                this.quotes.bid.push({ asset, price: util.round_to_tick( bids[0][0], T,  DP ) })

                for ( t=0; t<bids.length; t++ ) {

                    bid = bids[t];
                    mprice = util.round_to_tick( bid[0], T,  DP );

                    this.mega.deltabid( mprice, bid[1] );

                }

            }

            this.quotes.bid.sort( (a,b) => b.price - a.price );

        },

        stylebid( price ) {

            const b = this.quotes.bid;

            // $print(b)

            
            const behind = b.filter( f => f.price >= price );

            if ( behind.length > 1 )
                return 'color: black';

            const asset = behind[ 0 ].asset;
            
            // const which = b.findIndex( f => price <= f.price );

            // console.log( price, b.map( m => m.price ), which )

            // if ( which == -1 )
            //     return '';


            // console.log( asset )

            if ( asset.exchange == 'ibybit' )
                return 'color: #b1700f';
            
            if ( asset.exchange == 'bitmex' )
                return 'color: blue';

            // for ( let t=0; t<=b.length; t++ ) {
                
            //     const q1 = b[t].price;
            //     const q2 = b[t+1].price;

            //     if ( price <= q1 && price > q2 )
            //         return b[t].asset.exchange == 'ibybit' ? 'color: orange' : 'color: black'
            // }

            // // console.log( this.quotes.bid, price )
            // return 'color: red'

            return 'color: black'

        },

        numlevels( atick ) {

            return this.tick / atick * this.levels;

        },

        incompatible( data ) {

            // First time we're receiving any data
            if ( !this.asset ) {

                this.asset = $asset.aggregate( data.asset.normalized );

                // // Tell any interested listeners we've switched data context
                // for ( const L of this.aoutputs ) 
                //     $mitt.emit( `${L}:calibrate`, { asset: this.asset } );
                
                return false;
            }

            // We already have assets, does this incoming data match it?
            return !this.asset.compatible( data.asset );

        },


        detatchsource( sourceId ) {

            // Delete from the graph
            jsPlumb.deleteConnection( this.connections.inputs[ sourceId ] );
            
            // Remove from our list
            this.xinput( sourceId );

            // Notify user
            console.log('removed bad source');

        },


        xinput( sourceId ) {

            // Everything has been disconnected, reset the asset
            if ( this.ainputs.length == 0 ) {

                this.asset = null;
                this.tick = 0;

            }

        },


        notify() {

            // for ( const L of this.outputs ) 
            //     $mitt.emit(L.targetId, { orderbook: this.snapshot, contract } );

        },

        verify( contract, sourceId ) {

            if ( !Settings.ports.input.includes( contract.output ) ) 
                return { success: false, error: 'Input is not compatible' }

            if ( this.connections.inputs[ sourceId ] )
                return { success: false, warn: 'Input already attached' };

            return { success: true }

        },



        contract() {
            return {
                input: Settings.ports.input,
                output: Settings.ports.output
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
        // $mitt.on( `${this.id}:connection`, this.connection );

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
.asd {
    color: #b1700f
}

</style>