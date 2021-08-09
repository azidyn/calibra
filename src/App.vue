<template>
    <div id="app">

        <VueDragResize v-for="(w, index) in windows" :key="index" :w="w.width" :h="w.height" v-on:resizing="n => resize(n, w)" v-on:dragging="n => resize(n, w)" :id="w.id" dragHandle=".drag" style="background:pink; z-index: 1">
            <div class="drag noselect" style="background: #aaa">{{ w.title }}</div>
            <component :is="w.component" :source="w.data" @interact="w.interact" class="noselect" ></component>
           
        </VueDragResize>

    </div>
</template>

<script>
import VueDragResize from 'vue-drag-resize';
import COrderbook from './components/COrderbook.vue';
import Orderbook from './modules/Orderbook';

const GenID = () => Math.floor( Math.random() *  Date.now() );

export default {
    name: 'app',

    components: {
        VueDragResize,
        COrderbook
    },

    data() {
        return {
            init: false,
            windows: [],

            // jsp: null
        }
    },

    methods: {

        resize(newRect, win) {

            win.resized( newRect );

            for ( const i of this.windows )
                jsPlumb.revalidate( i.id );

        }
    },

    mounted() {

        const lob = new Orderbook({ title: 'BitMEX', exchange: 'bitmex', symbol: 'XBTUSD' });
        const lob2 = new Orderbook({ title: 'BitMEX', exchange: 'bitmex', symbol: 'ETHUSD' });
        // const lob3 = new Orderbook('win3', this.jsp );

        this.windows.push( lob )
        this.windows.push( lob2 )

        return;
        // this.windows.push( lob2 )
        // this.windows.push( lob3 )


        this.$nextTick( () => {

            jsPlumb.ready(() => {

                jsPlumb.importDefaults({
                    DragOptions: { cursor: 'hand', zIndex: 2000 },
                    PaintStyle: { stroke: '#666' },
                    EndpointHoverStyle: { fill: "orange" },
                    HoverPaintStyle: { stroke: "orange" },
                    EndpointStyle: { width: 16, height: 16, stroke: '#666', fill: '#888' },
                    Connector:[ "Flowchart"],
                    Endpoint: "Rectangle",
                    Anchors: "AutoDefault",
                    Container: "app"
                });

                const endpointInput = {
                    isSource: false,
                    isTarget: true,
                    beforeDrop: params => {
                        // console.log( params )
                        const target = this.windows.find( f => f.id == params.targetId );
                        const source = this.windows.find( f => f.id == params.sourceId );
                        return target.connect( source );

                    },
                    anchor: "AutoDefault",
                    maxConnections: 10,
                    paintStyle: { width: 16, height: 16, stroke: 'red', fill: 'red' }
                }

                jsPlumb.addEndpoint(lob.id, { isSource: true, isTarget: false, anchor: "AutoDefault" });
                // jsPlumb.addEndpoint(lob2.id, endpointInput );
                // jsPlumb.addEndpoint(lob3.id, { isSource: true, isTarget: false, anchor: "AutoDefault" });

                jsPlumb.bind("connection", (info, originalEvent) => {
                    console.log(info, originalEvent)
                });            


            });
        });



        // setTimeout( ()=> {

        //     const i1 = this.windows[0];
        //     const i2 = this.windows[1];

        //     // this.jsp.connect({
        //     //     source: i1.id,
        //     //     target: i2.id,
        //     //     endpoint: "Rectangle"
        //     // });            

        // }, 1000 );

    },

    beforeDestroy() {

        // jsPlumb.detachEveryConnection();
        jsPlumb.deleteEveryEndpoint();
    }
}

</script>


<style>
.drag {
    background:#aaa;
    color:white;
    height: 20px;
    text-align:left;
    padding: 4px;
    cursor:move;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100vw;
  height: 100vh;
}

.noselect { 
    user-select:none;
}

body, html {
    margin: 0;
    border: 0;
    padding: 0;
}
</style>
