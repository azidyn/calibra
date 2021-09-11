<template>
    <div>
        <Title :text="`Aggregate`"/>
         sources: {{ Object.keys( this.ainputs ).length }}, tick = {{ tick }}, dp = {{ dp }}, levels = {{ levels }}
         <!-- <br/>
         asks:
        <div>
            <div v-for="(ask, index) in megaask" :key="`a${index}`" >
                {{ ask }}
            </div>
    
        </div>
         <br/>
         bids:
        <div>
            <div v-for="(bid, index) in megabid" :key="index" >
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
       
            levels: 10,

            // quotes: {
            //     bid: [],
            //     ask: []
            // },

            mega: {
                book: null,
                snapshot: null
            },

            asset: null, // The normalized symbol for this aggregate book

            tick: 0,      // Current tick level
            dp: 999

        }
    },


    computed: {

        normalized() {
            return this.asset ? this.asset.normalized : null;
        },

        megabid () {
            return this.mega.snapshot ? this.mega.snapshot.bid : [];
            // return this.mega ? this.mega.snapshot( this.levels ).bid : [];
        },

        megaask () {
            return this.mega.snapshot ? this.mega.snapshot.ask.reverse() : [];
            // return this.mega ? this.mega.snapshot( this.levels ).ask.reverse() : [];
        },

    },

    methods: {

        update( data ) {

            if ( this.incompatible( data ) )  {
                
                $print('Incompatible data: ', data.asset.identifier );
                return this.detatchsource( data.sourceId );

            }

            if ( !data.orderbook )
                return;

            // Ensure tick at least matches the lowest resolution input
            this.tick = Math.max( this.tick, data.asset.price.tick );
            this.dp = Math.min( this.dp, data.asset.price.dp );

            // Tick size of the incoming data
            const atick = data.asset.price.tick;

            // Calculate number of levels to read from this book to match our agg output
            const levs = this.numlevels( atick );

           
            // Get best bid & ask for incoming data
            const quote = data.orderbook.quote();

            /* 
                Find price floor and ceiling of where to snapshot price to.
                Use a max price, cos if `levs`=200 that doesn't necessarily
                mean all 200 price levels have volume; there will be gaps
                and so level 200 might be way beyond the max bid/ask so 
                be sure to crop it there
            */
            const maxbid = quote.bid - ( levs * atick );
            const maxask = quote.ask + ( levs * atick );

            // Stored by source component
            this.$set( this.snapshots, data.sourceId, { asset: data.asset, snapshot: data.orderbook.snapshot( levs, maxbid, maxask ), orderbook: data.orderbook } );

            this.merge();
            
            // this.orderbooks[ data.asset.identifier ] = data.orderbook;
            // Vue.set( this.orderbooks, data.asset.identifier, data.orderbook );
            // console.log( this.orderbooks )

        },

        merge() {

            /*

                merge() is called after 1 or more of our snapshots{} is updated or a 
                new one is inserted

                `mega` the aggregated/merged book which is wiped each time here

            */

            if ( !this.mega.book )
                this.mega.book = new Book({ shadow: false });
            else
                this.mega.book.reset();

            // this.quotes.bid = [];

            /*
                For each orderbook we have to aggregate 
            */
            for ( const id in this.snapshots ) {

                const asset = this.snapshots[ id ].asset;
                const book = this.snapshots[ id ].snapshot;
                // const asset = this.snapshots[ id ].asset;

                // Bids
                let t=0, bids = book.bid, asks = book.ask;
                let mprice = 0;
                let bid, ask;
                let destinationtick = this.tick;
                
                const DP = this.dp;

                const native = asset.price.tick == destinationtick;

                // this.quotes.bid.push({ asset, price: util.round_to_tick( bids[0][0], T,  DP ) })

                /*
                    Iterate through this book's bids (decreasing price)
                    These are in the asset's native tick resolution e.g. XBTUSD 0.5 ticks
                */
                
                for ( t=0; t<bids.length; t++ ) {

                    bid = bids[t];
                    
                    /*
                        Here, we're mapping prices from exchange native tick precision (asset.price.tick, e.g. 0.5 )
                        to our aggregate tick precision e.g. this.tick = 5 
                        
                        For example using the above:
                        
                        exchange book       aggregate book
                        -----------------------------------
                            101.5       =>      100 
                            102.0       =>      100 
                            102.5       =>      105
                            103.0       =>      105
                            ...
                            107.0       =>      105
                            107.5       =>      110

                        If the this.tick == exchange native then skip the conversion
                        Why skip? Well, because I couldn't figure out the math to support
                        all cases including same-same e.g. 0.5 => 0.5 and also
                        ensuring the ask side is always in the next price group up
                        
                    */
                    mprice = native ? bid[0] : util.round_to_tick( bid[0], destinationtick , DP );

                    /* Use the delta version of Book() to merge with existing volume */
                    this.mega.book.deltabid( mprice, bid[1] );
                   
                }

                /* 
                    When grouping/aggregating ticks, need to ensure the ask prices
                    are nudged into the next band so best.ask != best.bid price
                */
                const offset = destinationtick / 2;

                for ( t=0; t<asks.length; t++ ) {

                    ask = asks[t];

                    mprice = native ? ask[0] : util.ceil_to_tick( ask[0] + offset, destinationtick, DP );
                   
                    this.mega.book.deltaask( mprice, ask[1] );
                }

             }

             this.mega.snapshot = this.mega.book.snapshot( this.levels );

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
            /*
                e.g.  ( 5 / 0.5 ) * 20 == 200 `aticks` required to match
            */
            return this.tick / atick * this.levels;

        },

        incompatible( data ) {

            /* 
                First time receiving data 
                Assign our `asset` a special aggregate asset based on 
                the first time connection's asset 
            */
            if ( !this.asset ) {

                
                this.asset = $asset.aggregate( data.asset.normalized );
                return false;

            }


            /*
                Our aggregate `asset` is already assigned, is this 
                incoming data compatible?
            */
            return !this.asset.compatible( data.asset );

        },



        /* Cleanup our data */
        xinput( sourceId ) {

            // Remove it's snapshot, exclude from merge
            this.$delete( this.snapshots, sourceId );

            console.log('inputs remain:', Object.keys( this.ainputs ).length );

            /* 
                Everything has been disconnected, reset the asset 
                for a new input
            */
            if ( this.ainputs.length == 0 ) {

                this.mega = { book: null, snapshot: null };
                this.snapshots = {};

                // this.quotes = {
                //     bid: [],
                //     ask: []
                // };

                this.asset = null;
                this.tick = 0;
                this.dp = 999;
            }

        },

        notify() {

            // Empty book
            if ( !this.asset ) 
                return;

            for ( const L of this.aoutputs ) {
                // console.log(L,  { asset: this.asset, snapshot: this.mega.snapshot, sourceId: this.id }  )
                $mitt.emit(`${L}:snapshot`, { asset: this.asset, snapshot: this.mega.snapshot, sourceId: this.id } );
            }

        },

        verify( contract, sourceId ) {

            if ( !Settings.ports.input.includes( contract.output ) ) 
                return { success: false, error: 'Input is not compatible' }

            return { success: true }

        },



        contract() {
            return Settings.ports;
        },



    },

    mounted() {

        // setInterval( () => {

        //     if ( this.tick == 1 )
        //         this.tick = 5;
        //     else
        //         this.tick += 5;
                
        // }, 2*5000 );

        $mitt.on( `${this.id}:orderbook`, this.update );
        $mitt.on('*:clock', this.notify );


    },

    beforeDestroy() {

        $mitt.off('*:clock', this.notify );

    },

}
</script>

<style>
.asd {
    color: #b1700f
}

</style>