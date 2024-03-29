
/*

    OrderbookManager.js

    Accepts Websocket messages marked 'orderbookL2' for all instruments.
    Maintains a list of Orderbook objects and routes orderboook delta messages
    to the correct book/instrument.

    
*/

// const Orderbook = require('./Orderbook');
import Orderbook from './Orderbook';

export default class OrderbookManager {

    constructor() { 
        
        // Multiple orderbooks here, e.g. library['ETHUSD'], library['XBTUSD']
        this.library = { };

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

    handle( msg ) {

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

        const L = this.library[ instrument ];

        // Prepare to calculate deltas 
        L.deltareset();

        const deltas = L[ action ]( msg.data );

        return { instrument, orderbook: this.library[ instrument ].lob, deltas };
    }


}



