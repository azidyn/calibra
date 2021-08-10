
/*

    index.js [ BitMEX ]

    Set up and manage the connection. Handle requests to subscribe to API topics.
    Routes Websocket messages to either OrderbookManager, TradeManager or whatever.

    TODO: test auto-reconnecting.
   
*/


// const Simulate          = require('../../util/simulate');
// const fs                = require('fs');
// const WebSocketClient   = require('../../ws/WebsocketClient');
// const OrderbookManager  = require('./orderbook/OrderbookManager');;
// const EventEmitter      = require('../../util/EventEmitter');

import OrderbookManager from './orderbook/OrderbookManager';
import ReconnectingWebSocket from 'reconnecting-websocket';
import EventEmitter from 'eventemitter3';
import Trade from './trade/Trade';

// import EventEmitter from '../../util/EventEmitter';

// const Trade             = require('./trade/Trade');

const URI       = 'wss://www.bitmex.com/realtime';
const CAPTURE   =  null;'./bitmex-xbt-eth-l2.json';

let json, messages = [];

// Record l2 stream for replay debugging
// if ( CAPTURE != null ) {

//     setTimeout( ()=> {

//         fs.writeFileSync( CAPTURE, JSON.stringify( messages ));
//         process.exit();

//     }, 30 * 1000 )

// }

export default class bitmex extends EventEmitter {

    constructor( opts={} ) {

        super();

        this.opts = opts;
        this.connected = false;

        this.library = new OrderbookManager();
        this.trade = new Trade({ aggregate: false });


        this.subs = { };

        this.ws = null;


    }

    trades( instrument ) {
        this.subscribe( instrument, 'trade' );
    }

    orderbook( instrument ) {

        this.subscribe( instrument, 'orderBookL2' );

    }

    stop( instrument, topic ) {
        //??????????????
    }

    subscribe( instrument, channel ) {

        this.subs[ instrument ] = this.subs[ instrument ] || [];

        let args = this.subs[ instrument ];

        if ( args.includes( channel ) )
            return;
        
        this.subs[ instrument ].push( channel );
     
        this.listen( this.fmt( instrument, channel ) );
        
    }

    listen( m ) {

        if ( !this.connected )
            return this.connect();

        this.ws.send( JSON.stringify( m ) );

    }

    connect()  {

        if ( this.connected )
            return;

        this.ws = new ReconnectingWebSocket( URI );

        this.ws.addEventListener( 'open', () => { 
           
            this.connected = true;

            for ( const i in this.subs ) {

                const args = this.subs[ i ];
                
                for ( const a of args )
                    this.listen( this.fmt( i, a ) );

            }

        });

        this.ws.addEventListener('close', (this.onclose).bind(this) );
        this.ws.addEventListener('message', (this.delegate).bind( this ));

    }

    onclose() {
        this.connected = false;
    }

    fmt( instrument, channel ) {

        return {
            op: "subscribe",
            args: [ `${channel}:${instrument}` ]
        };
    }

    delegate( message ) {

        json = JSON.parse( message.data );

        switch( json.table ) {

            case "orderBookL2": 

                let res = this.library.handle( json );
                if ( res ) this.emit(`orderbook:${res.instrument}`, res );
                break;

            case "trade":

                this.emit( 'trades', this.trade.handle( json.data ) )
                break;


        }

    }

}

