
import bitmex from '../exchange/bitmex';

const EXCHANGE = {
    bitmex
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