

module.exports = {

    'bitmex': {
        
        title: 'BitMEX',

        instrument: {

            'XBTUSD': {
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
                type: 'quanto',
                tick: 0.05,
                dp: {
                    price: 2,
                    volume: 0
                },

                tousd: ( size, price ) => size
            }

        }
    },

    'ibybit': {
        
        title: 'ByBit',

        instrument: {

            'BTCUSD': {
                type: 'inverse',
                tick: 0.5,
                dp: {
                    price: 1,
                    volume: 0
                },

                tousd: (size, price ) => size
            },

            'ETHUSD': {
                type: 'inverse',
                tick: 0.05,
                dp: {
                    price: 2,
                    volume: 0
                } 
            }

        }
    },

    'bybit': {
        
        title: 'ByBit',

        instrument: {

            'BTCUSDT': {
                type: 'linear',
                tick: 0.5,
                dp: {
                    price: 1,
                    volume: 0
                } 
            },

            'ETHUSDT': {
                type: 'linear',
                tick: 0.05,
                dp: {
                    price: 2,
                    volume: 0
                } 
            }

        }
    },

    'ftx': {
        
        title: 'FTX',

        instrument: {

            'BTC-PERP': {
                type: 'linear',
                tick: 0.5,
                dp: {
                    price: 1,
                    volume: 4
                } 
            },

            'ETH-PERP': {
                type: 'linear',
                tick: 0.01,
                dp: {
                    price: 2,
                    volume: 3
                } 
            }

        }
    },




}