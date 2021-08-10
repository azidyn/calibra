
class ExchangeAsset {
    constructor( opts ) {
        
        for ( const k in opts )
            this[ k ] = opts[ k ];

    }

    identifier() {
        return `${this.exchange}:${this.symbol}`;
    }

    same( asset ) {
        return this.identifier() == asset.identifier();
    }

    compatible( asset ) {
        return this.normalized == asset.normalized; 
    }
}

const MEX = 'bitmex', IBYB ='ibybit', FTX = 'ftx';
const FUT = 'futures';
const NORM_BTC = 'BTCUSD', NORM_ETH = 'ETHUSD';
const BITMEX_ETH_QUANTO_MUL = 0.000001;

export default [

    new ExchangeAsset({
        exchange: MEX,
        symbol:'XBTUSD',
        normalized: NORM_BTC,
        market: FUT,
        contract: 'inverse',
        price: { tick: 0.5, dp: 1 },
        size: { tick: 1, dp: 0 },
        value: ( size, price ) => size        
    }),
    new ExchangeAsset({
        exchange: MEX,
        symbol:'ETHUSD',
        normalized: NORM_ETH,
        market: FUT,
        contract: 'quanto',
        price: { tick: 0.05, dp: 2 },
        size: { tick: 1, dp: 0 },
        value: ( size, price, btcprice ) => (price * BITMEX_ETH_QUANTO_MUL * size) * btcprice
    }),    

    new ExchangeAsset({
        exchange: IBYB,
        symbol:'BTCUSD',
        normalized: NORM_BTC,
        market: FUT,
        contract: 'inverse',
        price: { tick: 0.5, dp: 1 },
        size: { tick: 1, dp: 0 },
        value: ( size, price ) => size        
    }),
    new ExchangeAsset({
        exchange: IBYB,
        symbol:'ETHUSD',
        normalized: NORM_ETH,
        market: FUT,
        contract: 'inverse',
        price: { tick: 0.05, dp: 2 },
        size: { tick: 1, dp: 0 },
        value: ( size, price ) => size
    }),     
];


