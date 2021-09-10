
import Assets from './Assets';
import ExchangeAsset from './ExchangeAsset';
export default class Asset {

    constructor() {
        this.assets = Assets;
    }

    get available() {
        return this.assets;
    }

    normalized( normalizedsymbol ) {
        return this.assets.filter( f => f.normalized == normalizedsymbol );
    }

    find( exchange, symbol ) {
        return this.assets.find( f => f.exchange == exchange && f.symbol == symbol );
    }

    findid( identifier ) {

        return this.assets.find( f => f.identifier == identifier );

    }

    aggregate( normalizedsymbol ) {
        return new ExchangeAsset({
            exchange: '_AGGREGATE_',
            aggregate: true,
            symbol: normalizedsymbol,
            normalized: normalizedsymbol,
            market: 'aggregate',
            contract: 'aggregate'
            // price: { tick: 0.5, dp: 1 },
            // size: { tick: 1, dp: 0 },
            // value: ( size, price ) => size        
        });
    }


    // Helper function to see if adding this asset is supported
    // used by imbalance, aggregate
    uniquecompatible( existingassets, newasset ) {

        if ( !newasset )
            return { success: false, error: `Input is blank`};

        if ( existingassets.length == 0 ) 
            return { success: true };

        for ( const A of existingassets ) {

            if ( A.same( newasset ) ) 
                return { success: false, warning: `${newasset.symbol} is already included`};

            if ( !A.compatible( newasset ) ) 
                return { success: false, error: `${newasset.symbol} is incompatible`};
        }

        return { success: true }

    }


}