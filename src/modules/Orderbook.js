
/* 
    Orderbook.js
    Represents an *instance* of an orderbook onscreen 

*/


const GenID = () => Math.floor( Math.random() *  Date.now() );

import Vue from 'vue';

export default class Orderbook {

    constructor(opts={}) {
        this.id = `lob_${GenID()}`;
        this.title = opts.title || 'Untitled';
        this.description = 'none';
        this.width = 200;
        this.height = 400;
        this.component = "COrderbook";

        this.exchange = opts.exchange;
        this.symbol = opts.symbol;

        this.socket = $network.socket( this.exchange );
        this.socket.on('orderbook', this.update, this );
        this.socket.orderbook( this.symbol );

        // this.data = Vue.observable({
        //     key: 0,
        //     bid: null,
        //     ask: null
        // });

        this.data = { 
            key: 0,
            bid: null,
            ask: null
        };


    }

    update( lob ) {

        if ( lob.instrument != this.symbol )
            return;

        this.data.key++;

        if ( this.data.key > 1000 )
            this.data.key = 0;

        const snapshot = lob.orderbook.snapshot( 3 );
        this.data.bid = snapshot.bid;

    }

    resized( rect ) {
        
    }

    interact(e) {
        console.log('event caught!', e )
    }

    /* 
        return false if connection invalid 
        - or - if another compatible orderbook, then create a 3rd aggregate
    */

    connect( from ) {
        console.log( 'tryig to connect to ', from )
        return true;
    }
}

