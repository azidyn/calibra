<template>
    <div>
        <Title :text="`${exchange}:${symbol}`"/>
        <div v-if="snapshot || true">
            
            <canvas ref="display" :width="canvsize.width" :height="canvsize.height"></canvas>

            
            <!-- {{ snapshot }} -->
            <!-- <div v-for="(bid, index) in snapshot.bid" :key="index">
                {{ bid }}
            </div> -->
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
            // emitter: mitt(),
            counter: 0,

            frequency: 500,

            orderbook: null,
            snapshot: null,

            timer: null,

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
                this.$nextTick( () => this.render() );
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

            this.render();

        },

        render() {

            if ( !this.snapshot )
                return;
            
            // this.ctx = this.$refs['display'].getContext("2d");

            const w = this.canvsize.width;
            const h = this.canvsize.height;

            this.ctx.clearRect(0, 0, w,h );

            // console.log(`set w=${w} h=${h} | canv w = ${this.ctx.canvas.width} h = ${this.ctx.canvas.height}`);

            // this.ctx.fillRect( 0,0,100,100 )
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "black"
            // this.ctx.strokeRect( 1,1,100,100 );

            const height = 25;
            // const max = h / height;

            for ( let y=1; y< h; y += height ) {
                this.ctx.moveTo( 1, y + 0.5 );
                this.ctx.lineTo( w-1, y + 0.5 )
                this.ctx.stroke();
            }

            this.ctx.font = "12px Georgia, monospace";
            
            let y = 1;
            for ( const b of this.snapshot.bid ) {
                this.ctx.fillText(`${b[0]}`,10, y + 0.5);
                y += 25;
                if ( y >= h ) break;

            }

            
            // this.ctx.rect( 1, 1, 100, 100 )
            // this.ctx.stroke();

        },

        notify() {

            for ( const L of this.outputs )  {

                $mitt.emit(`${L}:snapshot`, { asset: this.asset, snapshot: this.snapshot } );
                $mitt.emit(`${L}:orderbook`, { asset: this.asset, orderbook: this.orderbook  } );

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
            
            this.ctx = this.$refs['display'].getContext("2d");
            this.render();
            
        });

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