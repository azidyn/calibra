<template>
    <div id="app">

        <VueDragResize v-for="(w, index) in comps" :key="index" :w="w.size.width" :h="w.size.height" v-on:resizing="n => resize(n, w)" v-on:dragging="n => resize(n, w)" :id="w.id" dragHandle=".drag" style="background:pink; z-index: 1">
            <!-- <div class="drag noselect" style="background: #aaa">{{ 'orderbook'}}</div> -->
            <component 
                class="noselect"
                :is="w.component"  
                :config="w.config" 
                :size="w.size" 
                :id="w.id" 
                :listeners="w.listeners"
            >
            </component>
        </VueDragResize>

    </div>
</template>

<script>
import VueDragResize from 'vue-drag-resize';

import Orderbook from './components/Orderbook';
import Imbalance from './components/Imbalance';

const COMPONENT = {
    Orderbook,
    Imbalance
};


const GenID = () => Math.floor( (Math.random() * Date.now()) / 1000 );

export default {
    name: 'app',

    components: {
        VueDragResize,
        Orderbook,
        Imbalance
    },

    data() {
        return {
            init: false,
            comps: [],
            // jsp: null
        }
    },

    methods: {

        resize(newRect, win) {

            win.size.width = newRect.width;
            win.size.height = newRect.height;

            for ( const i of this.comps )
                jsPlumb.revalidate( i.id );

        }
    },

    mounted() {

        this.comps.push({ id: `ob_${GenID()}`, component: 'Orderbook', config:{ exchange: 'bitmex', symbol: 'XBTUSD' }, size: { width: 150, height: 300 }, listeners: [] });
        this.comps.push({ id: `ob_${GenID()}`, component: 'Orderbook', config:{ exchange: 'bitmex', symbol: 'ETHUSD' }, size: { width: 150, height: 300 }, listeners: []  });

        this.comps.push({ id: `im_${GenID()}`, component: 'Imbalance', config:{}, size: { width: 150, height: 300 }, listeners: []  });

        const lob1 = this.comps[0];
        const lob2 = this.comps[1];
        const imb = this.comps[2];

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

                        const tc = this.comps.find( f => f.id == params.targetId );
                        const sc = this.comps.find( f => f.id == params.sourceId );

                        const target = COMPONENT[ tc.component ];
                        const source = COMPONENT[ sc.component ];

                        const accept = target.accept( source );

                        if ( accept )
                            sc.listeners.push( params.targetId )

                        return accept;

                    },

                    beforeDetach: params => {

                        // const tc = this.comps.find( f => f.id == params.targetId );
                        const sc = this.comps.find( f => f.id == params.sourceId );

                        // Remove this target from listeners
                        sc.listeners = sc.listeners.filter( f => f != params.targetId );
                        
                    },

                    anchor: "AutoDefault",
                    maxConnections: 10,
                    paintStyle: { width: 16, height: 16, stroke: 'red', fill: 'red' }
                }

                jsPlumb.addEndpoint(lob1.id, { isSource: true, isTarget: false, anchor: "AutoDefault" });
                jsPlumb.addEndpoint(lob2.id, endpointInput );
                jsPlumb.addEndpoint(imb.id, endpointInput );

                // // jsPlumb.addEndpoint(lob3.id, { isSource: true, isTarget: false, anchor: "AutoDefault" });

                // jsPlumb.bind("connection", (info, originalEvent) => {
                //     console.log(info, originalEvent)
                // });            


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
