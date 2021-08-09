
/*

    OrderbookManager.js

    Accepts Websocket messages marked 'orderbookL2' for all instruments.
    Maintains a list of Orderbook objects and routes orderboook delta messages
    to the correct book/instrument.

    
*/

const fetch = require('node-fetch');
const Orderbook = require('./Orderbook');
const REST_API = 'https://fapi.binance.com/fapi/v1/depth'//symbol=BTCUSDT&limit=1000
const CORS_PROXY = 'https://morning-river-5119.azidyn.workers.dev/';



class OrderbookManager {

    constructor() { 
        
        // Multiple orderbooks here, e.g. library['ETHUSD'], library['XBTUSD']
        this.library = { };

        this.initialized = false;

        this.buffered = [];

    }

    snapshot( instrument, depth ) {

        if ( !this.library[ instrument ] )
            return undefined;

        return this.library[ instrument ].snapshot( depth );
    }

    aggregate( instrument, depth, group ) {

        if ( !this.library[ instrument ] )
            return undefined;

        return this.library[ instrument ].aggregate( depth, group );

    }

    async handle( msg ) {

        if ( !this.initialized ) {

            console.log('Not inialized... here we go...')

            this.buffered.push( msg );

            // this.initialized = false;
            let endpoint = `${REST_API}?symbol=${msg.data.s}&limit=1000`;
            
            let proxied = `${CORS_PROXY}?${endpoint}`;
            let res  = await fetch( proxied );
            let snapshot = await res.json();

            console.log( snapshot );

        }

        let action = msg.action;

        if ( action == 'partial' ) {
            
            // Full book reset on partial

            const lob = new Orderbook();
            this.library[ msg.filter.symbol ] = lob;

            return this.process( msg, 'insert' );

        } else {
            
            return this.process( msg, action );

        }

    }


    process( msg, action ) {

        if ( !msg.data || !msg.data.length ) 
            return;

        const instrument = msg.data[ 0 ].symbol;

        if ( !this.library[ instrument ] ) 
            return;

        this.library[ instrument ][ action ]( msg.data );

        return { instrument, orderbook: this.library[ instrument ].lob };
    }


}



module.exports = OrderbookManager;