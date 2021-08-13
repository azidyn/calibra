<template>
    <div>
        <Title :text="`${exchange}:${symbol}`"/>
        <div v-if="snapshot">
            {{ snapshot.bid }}
            <!-- <canvas ref="display" :width="canvsize.width" :height="canvsize.height"></canvas> -->
        </div>
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
const Clone = o => o ? JSON.parse( JSON.stringify( o )) : null;

export default {    

    props: ['config', 'size', 'id', 'outputs', 'inputs'],

    components: { Title },

    data() {
        return {
            socket: null,

            frequency: 500,     // Snapshot output frequency
            timer: null,         

            orderbook: null,    // Current full reconstructed book
            snapshot: null,     // Last snapshot of above

            ctx: null
        }
    },

    watch: {

        outputs: {

            immediate: true,
            deep: true,

            handler(n ,o ) {
                
                if ( this.outputs.length == 0 ) {

                    this.heartbeat( false );

                } else {

                    this.heartbeat( true );
                }
            }

        },

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
            
            this.orderbook = data.orderbook;
            this.snapshot = data.orderbook.snapshot( 10 );
            this.heartbeat( true );

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

        notify() {

            for ( const L of this.outputs )  {

                $mitt.emit(`${L}:snapshot`, { asset: this.asset, snapshot: this.snapshot } );
                $mitt.emit(`${L}:orderbook`, { asset: this.asset, orderbook: this.orderbook } );

            }

        },

        heartbeat( start=true ) {

            if ( start ) {

                if ( this.timer )
                    return;
                
                this.timer = setInterval( () => this.notify() , this.frequency)                

                return;

            } else {

                if ( !this.timer )
                    return;

                clearInterval( this.timer );
                this.timer = null;

                return;
            }

        },

        accept( ) {
            return { success: false }
        },

        contract() {
            return {
                
                input: Settings.ports.input,
                output: Settings.ports.output,
                asset: this.asset

            }

        }



    },

    mounted() {

        this.$nextTick( () => {
            
            // this.ctx = this.$refs['display'].getContext("2d");
            // this.ctx.font = "10px, monospace";
            
        });

        // requestAnimationFrame( this.render );

        this.socket = $network.socket( this.exchange );
        this.socket.on(`orderbook:${this.symbol}`, this.update, this );
        this.socket.orderbook( this.symbol );        
    },

    beforeDestroy() {

        this.heartbeat( false );

    },


    // accept( component ) {
    //     return false;
    // },

    // settings() {
    //     return Settings;
    // },

    test: {
        whatever: 123,
        hello: 'String guy'
    }

}
</script>

<style>

</style>