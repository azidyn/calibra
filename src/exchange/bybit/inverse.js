

// const WebSocketClient   = require('../../ws/WebsocketClient');
// const OrderbookManager  = require('./orderbook/OrderbookManager');;
// const Simulate          = require('../../util/simulate');
// const EventEmitter      = require('../../util/EventEmitter');
// const Trade             = require('./trade/Trade');

import OrderbookManager from './orderbook/OrderbookManager';
import ReconnectingWebSocket from 'reconnecting-websocket';
import EventEmitter from 'eventemitter3';
import Trade from './trade/Trade';

const URI = 'wss://stream.bybit.com/realtime';

let json, topic, messages = [];

export default class iByBit extends EventEmitter {

    constructor( opts={} ) {

        super();

        this.opts = opts;
        this.connected = false;

        this.library = new OrderbookManager();
        this.trade = new Trade({ exchange:'ibybit', sizetoquote: false, aggregate: true });

        if ( this.opts.simulate ) {
            
            console.log('Running simulation')
            Simulate.run( `${__dirname}/btcusd-l2-replay.json`, this.opts.simulate, (this.delegate).bind(this) );

            return;
        }

        this.subs = { };

        this.ws = null;
        
    }

    trades( instrument ) {

        this.subscribe( instrument, 'trade' );
    }


    orderbook( instrument ) {

        this.subscribe( instrument, 'orderBook_200.100ms' );
    }

    stop( instrument, topic ) {
        // unsubscribe from stream
    }

    subscribe( instrument, channel ) {

        if ( this.opts.simulate )
            return;

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

    connect( ) {

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

        // this.ws.open( URI );

    }

    onclose() {
        this.connected = false;
    }

    fmt( instrument, channel ) {

        return {
            op: "subscribe",
            args: [ `${channel}.${instrument}` ]
        };
    }

    delegate( message ) {

        json = JSON.parse( message.data );

        if ( !json.topic )
            return;
        
        // "orderBook_200.100ms.BTCUSD"
        topic = json.topic.split('.');


        switch( topic[0] ) {
            case "orderBook_200": 
                let res = this.library.handle( json, topic[2] );
                if ( res) 
                    this.emit(`orderbook:${res.instrument}`, res );
                break;
                
            default:
                // this.emit('trades', this.trade.handle( json.data ));
                break;

        }

    }

}

// module.exports = iByBit;
