
import bitmex from '../exchange/bitmex';
import ibybit from '../exchange/bybit/inverse';

const EXCHANGE = {
    bitmex,
    ibybit
};

export default class Network {

    constructor() {

        this.exchanges = {};

    }

    socket( e ) {

        if ( this.exchanges[ e ] )
            return this.exchanges[ e ];

        return this.exchanges[ e ] = new (EXCHANGE[ e ])();

    }
    
}