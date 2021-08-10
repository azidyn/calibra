
export default {

    H: ( authtoken, extra={} ) => ( { ...extra, headers: { Authorization: `Bearer ${authtoken}` } } ),

    delay: ms => new Promise( (resolve, _) => setTimeout( () => resolve(), ms )),

    // linear interpolation
    lerp: ( x1, x2, a ) => ((1-a) * x1) + ( a * x2 ),

    SAFEGET: ( obj, path, def ) => {

        let nodes = path.split('/');
        let node = obj;
        let c = 0;

        for ( let n of nodes  ) {

            if ( c++ > MAX_ITERATIONS )
                return def;

            if ( node[n] == undefined || node[n] == null )
                return def;

            node = node[n];
        }

        return node
    },

    round_to_tick: ( value, tick_size=0.5, dp=1 ) => Number((tick_size * Math.round( value/tick_size )).toFixed( dp )),
    floor_to_tick: ( value, tick_size=0.5, dp=1 ) => Number((tick_size * Math.floor( value/tick_size )).toFixed( dp )),

    datetimelocale: ( epoch, parts='both' ) => {

        let d = new Date( epoch ),      // Convert the passed timestamp to milliseconds
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),      // Months are zero based. Add leading 0.
        dd = ('0' + d.getDate()).slice(-2),                     // Add leading 0.
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),         // Add leading 0.
        sec = ('0' + d.getSeconds()).slice(-2),         // Add leading 0.
        ampm = 'AM',
        time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh == 0) {
            h = 12;
        }

        // e.g. 2021-02-25, 4:58 PM
        return parts == 'both'  ? yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm
                                : ( parts == 'date' ? yyyy + '-' + mm + '-' + dd : h + ':' + min + ':' +sec + ' ' + ampm );
    },

    istoday: epoch => {

        let now = new Date();
        let then = new Date( epoch );

        return  now.getFullYear() == then.getFullYear() &&
                now.getMonth() == then.getMonth() &&
                now.getDate() == then.getDate();

    },


    // Converts an object with keys into an array
    arrayify: ( object, insertkey=null ) => {

        let arr = [];
        for ( let id in object ) {
            let o = object[ id ];

            // Insert the key as a named property
            if ( insertkey ) o[ insertkey ] = id;

            arr.push( o );
        }

        return arr;

    },

    throw_ftx: e => {

        if ( config.errors.log ) {
            console.log(`${(new Date()).toISOString()}`);
            console.log( e );
        }

        throw {
            error: true,
            message: e_msg( e ),
            code: e.code || 0
        }
    },

    throw_bybit: e => {

        if ( config.errors.log ) {
            console.log(`${(new Date()).toISOString()}`);
            console.log( e );
        }

        throw {
            error: true,
            message: e_msg( e )
        }

    },

    flip: side => side == 'long' ? 'short' : 'long',

    split: (N, string) => {

        /*
            Split a long string into multiple lines[]
        */

        let app = string.split(' ');
        let arrayApp = [], stringApp = "";

        app.forEach( (sentence,index) => {

          stringApp += sentence+' ';

          if( ( index+1 ) % N === 0 ){
            arrayApp.push( stringApp );
            stringApp = '';
          } else if ( app.length === index+1 && stringApp !== '' ) {
            arrayApp.push( stringApp );
            stringApp = '';
          }

        });

        return arrayApp;

    },

    clamp: ( v, min, max ) => Math.min( Math.max( min, v ), max ),

    // Linear space mapping functions
    mapping: {
        linear: x => x,

        // ease in (expand lower numbers, race through higher)
        icubic: x => x*x*x,
        isine: x => 1 - Math.cos((x * Math.PI) / 2),

        // ease out (skip through lower numbers rapidly)
        ocubic: x => 1 - Math.pow(1 - x, 3),
        osine: x => Math.sin((x * Math.PI) / 2)
    },

    // FIXME: Move this somewhere else
    FTX_IP_RL_DELAY: symbol => ['BTC-PERP', 'ETH-PERP'].includes( symbol ) ? (1000 / 6) >> 0 : (1000 / 10) >> 0,


    latency: uri => new Promise( resolve => {

        request({

            uri,
            method: 'GET',
            time: true

        }, (err, resp) => {

            resolve( err ? { error: true } : resp.timings );

            /*
                re: https://github.com/request/request#requestoptions-callback

                `timings` Contains event timestamps in millisecond resolution relative to timingStart. If there were redirects, the properties reflect the timings of the final request in the redirect chain:

                socket Relative timestamp when the http module's socket event fires. This happens when the socket is assigned to the request.
                lookup Relative timestamp when the net module's lookup event fires. This happens when the DNS has been resolved.
                connect: Relative timestamp when the net module's connect event fires. This happens when the server acknowledges the TCP connection.
                response: Relative timestamp when the http module's response event fires. This happens when the first bytes are received from the server.
                end: Relative timestamp when the last bytes of the response are received.

            */

        });
    })

}



