
// const Aggregate = require('../util/aggregate');
// const Bids = require('./bids');
// const Asks = require('./asks');

import Aggregate from '../util/aggregate.js';
import Bids from './bids.js';
import Asks from './asks.js';

export default class Book {

    constructor( opts={} ) {

        // this.useref = opts.useref || false;
        this.useref = false;

        this.bids = new Bids( this.useref, opts.shadow || false );
        this.asks = new Asks( this.useref, opts.shadow || false );

        this.agg = new Aggregate();

    }

    reset() {
        this.bids.reset();
        this.asks.reset();
    }

    deltabid( price, size ) {
        this.bids.set( price, size, true );
    }

    deltaask( price, size ) {
        this.asks.set( price, size, true );
    }

    bid( price, size ) {
        this.bids.set( price, size );
    }

    ask( price, size ) {
        this.asks.set( price, size );
    }

    peek( side, price ) {

        return side == 'ask' ? this.asks.peek( price ) : this.bids.peek( price );

    }

    quote( ) {
        return { bid: this.bids.best(), ask: this.asks.best() };
    }

    snapshot( levels, maxbid=null, maxask=null ) {
        return {
            bid: this.bids.snapshot( levels, maxbid ),
            ask: this.asks.snapshot( levels, maxask )
        }
    }

    aggregate( levels, group, dp ) {

        let tick_size = 0.5;
        const span = levels * ( group / tick_size );

        let bid = this.bids.snapshot( span );
        let ask = this.asks.snapshot( span );

        return this.agg.group( bid, ask, levels, group, dp );

    }

}

// module.exports = Book;