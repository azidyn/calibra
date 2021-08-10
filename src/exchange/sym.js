
const BITMEX_ETH_QUANTO_MUL = 0.000001;

// module.exports = [
//     { 
//         exchange:'bitmex',
//         symbol:'XBTUSD',
//         normalized:'BTCUSD',
//         market: 'futures',
//         tick: 0.5,
//         contract: 1,
//         dp: {
//             price: 1,
//             volume: 0
//         },
//         tousd: ( size, price ) => size

//     }
// ]



module.exports = {

    'bitmex': {
        
        title: 'BitMEX',

        instrument: {

            'XBTUSD': {
                market: 'future',
                normalized: 'BTCUSD',
                type: 'inverse',
                tick: 0.5,
                contract: 1,
                dp: {
                    price: 1,
                    volume: 0
                },

                tousd: ( size, price ) => size

            },

            'ETHUSD': {
                market: 'future',
                normalized: 'ETHUSD',
                type: 'quanto',
                tick: 0.05,
                dp: {
                    price: 2,
                    volume: 0
                },

                tousd: ( size, price, btcprice ) => {
                    return (price * BITMEX_ETH_QUANTO_MUL * size) * btcprice;
                }
            }

        }
    },

    'ibybit': {
        
        title: 'ByBit',

        instrument: {

            'BTCUSD': {
                market: 'future',
                normalized: 'BTCUSD',
                type: 'inverse',
                tick: 0.5,
                dp: {
                    price: 1,
                    volume: 0
                },

                tousd: (size, price ) => size
            },

            'ETHUSD': {
                market: 'future',
                normalized: 'ETHUSD',
                type: 'inverse',
                tick: 0.05,
                dp: {
                    price: 2,
                    volume: 0
                },
                tousd: ( size, price ) => size
            }

        }
    },

    'bybit': {
        
        title: 'ByBit',

        instrument: {

            'BTCUSDT': {
                market: 'future',
                normalized: 'BTCUSD',
                type: 'linear',
                tick: 0.5,
                dp: {
                    price: 1,
                    volume: 0
                },
                tousd: ( size, price ) => Math.round( size * price )
            },

            'ETHUSDT': {
                market: 'future',
                normalized: 'ETHUSD',
                type: 'linear',
                tick: 0.05,
                dp: {
                    price: 2,
                    volume: 0
                },
                tousd: ( size, price ) => Math.round( size * price )
            }

        }
    },

    'ftx': {
        
        title: 'FTX',

        instrument: {

            'BTC-PERP': {
                market: 'future',
                normalized: 'BTCUSD',
                type: 'linear',
                tick: 1,
                dp: {
                    price: 1,
                    volume: 4
                },
                tousd: ( size, price ) => Math.round( size * price )
            },

            'ETH-PERP': {
                market: 'future',
                normalized: 'ETHUSD',
                type: 'linear',
                tick: 0.01,
                dp: {
                    price: 2,
                    volume: 3
                },
                tousd: ( size, price ) => Math.round( size * price )
            }

        }
    },




}