

export default class ExchangeAsset {

    constructor( opts ) {
        
        for ( const k in opts )
            this[ k ] = opts[ k ];

    }

    get identifier() {
        return `${this.exchange}:${this.symbol}`;
    }

    /*  
       EXACT match 
        e.g. bitmex:XBTUSD == bitmex:XBTUSD
        e.g. kraken:XBTUSD != bitmex:XBTUSD
    */
    same( asset ) {
        if ( !asset ) 
            $print('null asset')
        return this.identifier == asset.identifier;
    }

    /*
        ASSET match 
        e.g. bitmex:XBTUSD == coinbase:BTCUSD
    */
    compatible( asset ) {
        return this.normalized == asset.normalized; 
    }

    /*
        MARKET match
        Separates into SPOT and FUTURES markets
        
        e.g. bitmex:XBTUSD == ftx:BTCPERP
        e.g. bitmex:XBTUSD == binancefutures:BTCUSDTPERP
        e.g. bitmex:XBTUSD != binance:BTCUSDT
    */
    marketcompatible( asset ) {
        return ( this.normalized == asset.normalized ) && ( this.market == asset.market );
    }

    
    /*
        Check linear / inverse ?
    */
    contractcompatible( asset ) {

    }
}