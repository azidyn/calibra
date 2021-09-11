

// The line between
const connector =  [ "Straight", { /*stub: [40, 60],*/ gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ];
const connectorStyle = { stroke:'#666', strokeWidth: 3 };

/*
     I   o   I   o   I   o   I   o   I
0.0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1.0 
0.1 o 					                0.1 o
0.2 I					                0.2 I
0.3 o					                0.3 o
0.4 I					                0.4 I
0.5 o 					                0.5 o
0.6 I					                0.6 I
0.7 o					                0.7 o
0.8 I					                0.8 I
0.9 o					                0.9 o
1.0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1.0 
     I   o   I   o   I   o   I   o   I


*/

module.exports = {

    endpoint: {

        input: {
            isSource: false,
            isTarget: true,
            // anchor:[ [ 0.2, 0, 0, -1 ],  [ 1, 0.2, 1, 0 ], [ 0.8, 1, 0, 1 ], [ 0, 0.8, -1, 0 ] ],
            anchor:  [
                // [0, 0.9, -1, 0 ],          // bottom left
                // [0, 0.5, -1, 0 ],       // middle left
                // [0,0, 0, -1],           // top left corner
                // [0.5,0, 0, -1],         // top middle
                // [0.9, 0, 0, -1 ]          // top right 

                [ 0.0, 0.8 ],               // Left hand side  bottom => top
                [ 0.0, 0.6 ],
                [ 0.0, 0.3 ],
                [ 0.0, 0.2 ],

                [ 0.1, 0.0 ],               // Top side, left => right
                [ 0.3, 0.0 ],
                [ 0.5, 0.0 ],
                [ 0.7, 0.0 ],
                [ 0.9, 0.0 ],

                [ 1.0, 0.2 ],               // Right hand side top => bottom
                [ 1.0, 0.4 ],
                [ 1.0, 0.6 ],
                [ 1.0, 0.8 ],

                [ 0.9, 1.0 ],               // Bottom side right => left
                [ 0.7, 1.0 ],
                [ 0.5, 1.0 ],
                [ 0.3, 1.0 ],
                [ 0.1, 1.0 ],

            ],

            // anchor: 'Continuous',
            // anchors:[ [ "Perimeter", { shape:"Rectangle"  } ] ],

            paintStyle: { 
                radius: 7,
                stroke: 'black',
                fill: 'white'
            },

            maxConnections: 1,

            // beforeDrop: params => {

            //     const tc = this.comps.find( f => f.id == params.targetId );
            //     const sc = this.comps.find( f => f.id == params.sourceId );
                
            //     const target = GetComp( params.targetId, this.$refs );
            //     const source = GetComp( params.sourceId, this.$refs );
            //     if ( !target || !source )  {
            //         console.error(`Error finding component: `, target, source );
            //         return false
            //     }
            //     const verify = target.verify( source.contract() );
            //     if ( !verify.success ) { 
            //         if ( verify.error )
            //             alert( verify.error );
            //         if ( verify.warning )
            //             $print( verify.warning );
            //     }
            //     return verify.success;

            // },



        },

        output: {

            isSource: true, 
            isTarget: false, 

            paintStyle: { 
                radius: 7,
                stroke: 'black',
                fill: 'gray'
            },


/*
     I   o   I   o   I   o   I   o   I
0.0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1.0 
0.1 o 					                0.1 o
0.2 I					                0.2 I
0.3 o					                0.3 o
0.4 I					                0.4 I
0.5 o 					                0.5 o
0.6 I					                0.6 I
0.7 o					                0.7 o
0.8 I					                0.8 I
0.9 o					                0.9 o
1.0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1.0 
     I   o   I   o   I   o   I   o   I


*/            

            anchor:[
                // [ 1, 0.5, 1, 0 ],       // middle right
                // [ 0.1, 1, 0, 1 ],       // bottom left
                // [ 0.5, 1, 0, 1 ],       // bottom middle
                // [ 1, 1, 1, 0 ],         // bottom right
                // [ 1, 0.1, 1, 0 ]        // top right

                [ 0.0, 0.9 ],           // Left hand side bottom => top 
                [ 0.0, 0.7 ],
                [ 0.0, 0.5 ],
                [ 0.0, 0.3 ],
                [ 0.0, 0.1 ],

                [ 0.2, 0.0 ],           // Top side left => right
                [ 0.4, 0.0 ],
                [ 0.6, 0.0 ],
                [ 0.8, 0.0 ],

                [ 1.0, 0.1 ],           // Right hand side top => bottom
                [ 1.0, 0.3 ],
                [ 1.0, 0.5 ],
                [ 1.0, 0.7 ],
                [ 1.0, 0.9 ],

                [ 0.8, 1.0 ],
                [ 0.6, 1.0 ],
                [ 0.4, 1.0 ],
                [ 0.2, 1.0 ]

            ],

            // anchors:          [ "Perimeter", { shape: "Rectangle"  } ],            
            
            connector,
            connectorStyle,

            maxConnections: 10, 

        }

    }


}