
export default class Asks {

    constructor( useref=false, shadow=false ) {
        
        /*
            ordered list of prices which point to an index

            [ 
                [ price, quantity],
                [ 1234.5, 10000 ],
                ...
            ]
        */

        this.useref = useref;
        this.set = this.set_asks;

        // this.shadow = shadow;

        this.reset();

    }

    reset() {
        this.ticks = [];

        this.r_snapshot = [];
 
        // Array index pointing to the best quote, must keep track of this
        this.head = 0;
 
    }

    peek( price ) {
        
        // book empty
        if ( !this.ticks.length )
            return null;

        const i = this.find( price );
        const item = this.ticks[ i ];

        if ( item[0] == price ) 
            return item;
        
        // price not found
        return null;
    }

    best() {
        return this.ticks[ this.head ];
    }


    set_asks( price, size, delta=false ) {

        let diff = size;

        // First insert
        if ( !this.ticks.length ) {
            // this.ticks.push( this.shadow ? [ price, size, size ] : [ price, size ] );
            this.ticks.push( [ price, size ] );
            this.head = 0;
            return diff;
        }

        // Binary search our asks[] for closest price
        const i = this.find( price );
        const itemhead = this.ticks[ this.head ];
        
        // Get the returned [ price, volume ]
        const item = this.ticks[ i ];

        // Found an exact (existing price level) match?
        if ( item[0] == price ) {
            
            diff = delta ? size : size - item[ 1 ];
            // let o = item[1];
            // Update the size
            item[1] = delta ? Math.max( 0, item[1] + size ) : size;

            // if ( this.shadow )
            //     item[2] = item[1] - o;
            
            if ( this.head == i && item[1] == 0 ) {

                // The current update is on the head which is being deleted!    
                // Find the next item in the book with volume 

                this.head = this._nz_scan( i + 1 );
                this.headcheck();
       
            } else if ( price < this.ticks[ this.head ][0] ) {

                // The current update is for a price lower than our current head
                // so set the new head
                // This would be a previously inserted head/node/pricelevel that had been zeroed
                // at some point before and is now being reestablished

                this.head = i;
            }

            return diff;
        }

        // New price level, insert it now

        const before = price < item[0];
        let ins = before ? i : i + 1;

        // Insert the new price level at array index `ins`
        // this.ticks.splice( ins, 0, this.shadow ? [ price, size, size ] : [ price, size ] );
        this.ticks.splice( ins, 0, [ price, size ] );

        // Inserted a new level in front of the head. `this.head` index must be updated now
        // Note that `this.head` index is invalid now anyway because of the insert
        if ( before && price < itemhead[0] ) {
            this.head = this._nz_scan( ins );
            this.headcheck();
        }

        return diff;

    }

    headcheck() {

        // If the book was overwritten with zeroes (eliminating all volume at price) 
        // This can be an invalid mess, so just wipe the book continuously
        // if zeros continue to be inserted. Big speed penalty but this is totally unsupported behavior.
        if ( this.head == null ) {
            this.head = 0;
            this.ticks = [];
        }
            

    }    

    // Snapshot of the order book (prices with volume) for a given number of levels
    snapshot( levels, maxprice=null ) {

        if (!this.ticks.length ) return [];

        if ( this.useref ) {

            // Requested a smaller snapshot that last time, delete book start again
            if ( levels < this.r_snapshot.length )
                this.r_snapshot = [];

            let i = 0;
            const S = this.r_snapshot;

            
            for ( let t=this.head; t<this.ticks.length; t++) {

                if ( this.ticks[t][1] > 0 ) {
                    if ( !S[i] ) S[i] = [0,0];
                    S[ i ][ 0 ] = this.ticks[t][0];
                    S[ i ][ 1 ] = this.ticks[t][1];
                    i++;
                }

                if ( i == levels ) break;                

            }

            return this.r_snapshot;

        } else {
            
            let book = [];
            
            for ( let t=this.head; t<this.ticks.length; t++) {

                if ( this.ticks[t][1] > 0 ) 
                    book.push( [ this.ticks[t][0], this.ticks[t][1] ] );
                    // book.push( this.shadow ? [ this.ticks[t][0], this.ticks[t][1], this.ticks[t][2] ] : [ this.ticks[t][0], this.ticks[t][1] ]  );

                if ( book.length == levels ) break;
                if ( maxprice && this.ticks[t][0] >= maxprice ) break;

            }

            return book;
        }

    }

    // Modified binary search
    find( target ) {

        let arr = this.ticks;
        let n = arr.length;

        // Corner cases 
        if ( target <= arr[0][0] ) 
            return 0;//arr[0]; 

        if ( target >= arr[n - 1][0] ) 
            return n-1;//arr[n - 1]; 

        // Doing binary search  
        let i = 0, j = n, mid = 0; 

        while (i < j) 
        { 
            mid = ( i + j ) >> 1;

            if ( arr[mid][0] == target ) {
                return mid;//arr[mid]; 
            }

            /* If target is less  
            than array element, 
            then search in left */
            if ( target < arr[mid][0] )  
            { 
                // If target is greater  
                // than previous to mid,  
                // return closest of two 
                if (mid > 0 && target > arr[mid - 1][0] )   {
                    
                    // console.log('<mid')
                    // return this._getClosest( arr[mid - 1], arr[mid], target ); 
                    return this._getClosest( mid - 1, mid, target ); 
                }
                /* Repeat for left half */
                j = mid;              
            
            } else { 
                // If target is  
                // greater than mid 
                
                if ( mid < n-1 && target < arr[mid + 1][0] )  {
                    // console.log('arr=', arr);
                    // console.log(`mid=${mid}`);
                    // return this._getClosest( arr[mid],  arr[mid + 1], target );
                    return this._getClosest( mid,  mid + 1, target );
                }

                i = mid + 1; // update i 
            } 

        }         
        
    }

    // Step through existing levels from index `from` => upwards,
    // look for the first price level with volume 
    _nz_scan( from ) {

        for ( let t=from; t<this.ticks.length;t++)
            if ( this.ticks[t][1] > 0 ) return t;

    }

    _getClosest(val1, val2, target)  { 

        
        if (target - this.ticks[val1][0] >= this.ticks[val2][0] - target)  
            return val2;
        else
            return val1;

    }     
}

// module.exports = Asks;