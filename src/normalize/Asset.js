
import Assets from './Assets';

export default class Asset {

    constructor() {
        this.assets = Assets;
    }

    normalized( normalizedsymbol ) {
        return this.assets.filter( f => f.normalized == normalizedsymbol );
    }

    find( exchange, symbol ) {
        return this.assets.find( f => f.exchange == exchange && f.symbol == symbol );
    }

    findid( identifier ) {

        return this.assets.find( f => f.identifier() == identifier );

    }


}