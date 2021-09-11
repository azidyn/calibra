<template>
    <div>
        <Title :text="`${exchange}:${symbol}`"/>
        <!-- <div v-if="snapshot">
            <div v-for="(bid, index) in snapshot.bid" :key="index">
                {{ bid }}
            </div>
        </div> -->
            <!-- <canvas ref="display" :width="canvsize.width" :height="canvsize.height"></canvas> -->
    </div>
</template>

<script>

const Settings = {
    ports: {
        input: [],
        output: 'Orderbook'
    },
    connections: 10
}


import Title from './common/Title.vue';

import { Connection } from './mixins/Connection';

export default {    

    mixins: [ Connection ],

    props: ['config', 'size', 'id' ], //, 'outputs', 'inputs'],
   
    components: { Title },

    data() {
        return {
            socket: null,

            orderbook: null,    // Current full reconstructed book
            snapshot: null,     // Last snapshot of above
            delta: null,        // deltas from last update

            levels: 5,

            ctx: null,

            str: 'test'
        }
    },

    watch: {

        // outputs: {

        //     immediate: true,
        //     deep: true,

        //     handler(n ,o ) {
                
        //         if ( this.outputs.length == 0 ) {

        //             this.heartbeat( false );

        //         } else {

        //             this.heartbeat( true );
        //         }
        //     }

        // },

        size: {
            deep: true,
            handler(){
                // this.$nextTick( () => this.render() );
            }
        }
    },

    computed: {


        canvsize() {
            return { width: this.size.width - 10, height: this.size.height - 30 }
        },
        asset() {
            return this.config.asset;
        },
        symbol() {
            return this.asset.symbol;
        },
        exchange() {
            return this.asset.exchange;
        }
    },


    methods: {

        update( data ) {

            this.deltas = data.deltas;
            this.orderbook = data.orderbook;
            this.snapshot = data.orderbook.snapshot( this.levels );

            this.notifyhigh();

        },

        render() {

            return;
           
            if ( !this.snapshot ) {
                requestAnimationFrame( this.render );
                return;
            }

            const n = Date.now();
            
            const w = this.canvsize.width;
            const h = this.canvsize.height;

            this.ctx.clearRect(0, 0, w,h );

            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "black"


            const height = 25;

            // this.ctx.moveTo( 1, 1 );
            // this.ctx.lineTo( w-1, h-1 )
            // this.ctx.stroke();
            const max = Math.max(50, Math.min( 400, h ) );

            for ( let t=0; t<10; t++ ) {
                const y = 1 + ( t * 25 );
                
                this.ctx.moveTo( 1, y );
                this.ctx.lineTo( 100-1, y )
                this.ctx.stroke();

            }


            // for ( let y=1; y< max; y += height ) {
            //     this.ctx.moveTo( 1, y );
            //     this.ctx.lineTo( w-1, y )
            //     this.ctx.stroke();
            // }

            
            // let y = 1;
            // for ( const b of this.snapshot.bid ) {
            //     this.ctx.fillText(`${b[0]}`,10, y + 0.5);
            //     y += height;
            //     if ( y >= h ) break;

            // }

//            requestAnimationFrame( this.render );

            // $print(`time `, Date.now() - n )
            
        },

        /* 
            Called periodically from system clock 
            sends: full book, snapshot
        */ 
        notify() {

            for ( const L of this.aoutputs ) {

                $mitt.emit(`${L}:snapshot`, { asset: this.asset, snapshot: this.snapshot, sourceId: this.id } );
                $mitt.emit(`${L}:orderbook`, { asset: this.asset, orderbook: this.orderbook, sourceId: this.id } );

            }

        },

        /* 
            Called on EVERY lob update 
            sends: full book, deltas
        */
        notifyhigh() {

            for ( const L of this.aoutputs ) {

                $mitt.emit(`${L}:orderbook:high`, { asset: this.asset, orderbook: this.orderbook, deltas: this.deltas, sourceId: this.id } );

            }

        },




        verify( contract ) {

            if ( !Settings.ports.input.includes( contract.output ) ) 
                return { success: false, error: 'Input is not compatible' }

            return { success: true }

        },

        contract() {

            return Settings.ports;

        }

    },

    mounted() {

        // this.socket = $network.socket( this.exchange );
        // this.socket.on(`orderbook:${this.symbol}`, this.update, this );
        // this.socket.orderbook( this.symbol );        

        $mitt.on('*:clock', this.notify );

    },

    beforeDestroy() {

        $mitt.off('*:clock', this.notify );

        console.log(`Destroying ${this.exchange}:${this.symbol} orderbook`);

    },



}
</script>

<style>

</style>