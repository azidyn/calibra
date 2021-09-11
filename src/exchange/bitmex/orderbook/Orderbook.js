

/*

    Orderbook.js

    Class that holds a full orderbook (Bid and Ask) for a single instrument
    Handles updates, deletions and insertions

    `this.lob`  the actual orderbook data structure; a class that maintains a sorted list 
                of prices and volume at price. Uses binary search O(log n) to find an entry.
                .snapshot() method returns a reference array of the bid/ask to a given depth
    
*/


// const bugger    = buggerit( true );
// const Book      = require('../../../lob');
import Book from '../../../lob';

export default class Orderbook {

    constructor() {

        // Map `id` to price. I kinda hate this, shouldn't really
        // enforce a client-side structure down the wire.

        // When a delete or update is sent from BitMEX, they do not send the price
        // but rather a mysterious 'id' key.
        // The price that the given 'id' maps too is given to us on an earlier insert
        // so we must keep track of it with a Map()

        this.id = new Map();
        this.lob = new Book();

        this.deltaframe = [];

    }

    deltareset() {
        this.deltaframe = [];
    }

    aggregate( depth, group ) {
        
        return this.lob.aggregate( depth, group );

    }

    snapshot( depth ) {

        return this.lob.snapshot( depth );

    }
    
    insert( deltas ) {

        let delta;

        for ( delta of deltas ) {
        
            // Make a note of which id => price, need this for updates/deletes
            this.id.set( delta.id, delta.price );

            /*
                Old method
                // Apply the delta
                if ( delta.side == 'Buy' ) 
                    this.lob.bid( delta.price, delta.size );
                else 
                    this.lob.ask( delta.price, delta.size );
            */

            if ( delta.side == 'Buy' ) 
                this.deltaframe.push( [ delta.price, this.lob.bid( delta.price, delta.size ), 0 ] ); // 0 = bid, 1 = ask
            else 
                this.deltaframe.push( [ delta.price, this.lob.ask( delta.price, delta.size ), 1 ] );

        }

        // UNSORTED
        return this.deltaframe;
        
    }

    update( deltas ) {

        let delta, price;

        for ( delta of deltas ) {

            price = this.id.get( delta.id );

            if ( !price ) 
                continue;

            /*
                if ( delta.side == 'Buy' ) 
                    this.lob.bid( price, delta.size )
                else
                    this.lob.ask( price, delta.size )
            */

            if ( delta.side == 'Buy' ) 
                this.deltaframe.push( [ price, this.lob.bid( price, delta.size ), 0 ] );
            else
                this.deltaframe.push( [ price, this.lob.ask( price, delta.size ), 1 ] );
    
        }       

        return this.deltaframe;

    }

    delete( deltas ) {

        let delta, price;

        for ( delta of deltas ) {

            price = this.id.get( delta.id );
            
            if ( !price ) 
                continue;

            if ( delta.side == 'Buy' ) 
                this.deltaframe.push( [ price, this.lob.bid( price, 0 ), 0 ] );
            else
                this.deltaframe.push( [ price, this.lob.ask( price, 0 ), 1 ] );

        }       

        return this.deltaframe;

    }

}


// module.exports = Orderbook;