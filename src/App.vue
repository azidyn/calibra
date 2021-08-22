<template>
    <div id="app">

        <VueDragResize v-for="(w, index) in comps" :key="index" :w="w.size.width" :h="w.size.height" v-on:resizing="n => resize(n, w)" v-on:dragging="n => resize(n, w)" :id="w.id" dragHandle=".drag" style="background:#ccc; z-index: 1">
            <!-- <div class="drag noselect" style="background: #aaa">{{ 'orderbook'}}</div> -->
            <component 
                class="noselect"
                :ref="`c_${w.id}`"
                :is="w.component"  
                :config="w.config" 
                :size="w.size" 
                :id="w.id" 
                :inputs="w.inputs"
                :outputs="w.outputs"
            >
            </component>
        </VueDragResize>

    </div>
</template>

<script>
import VueDragResize from 'vue-drag-resize';

import Orderbook        from './components/Orderbook';
import Imbalance        from './components/Imbalance';
import Aggregatebook    from './components/Aggregatebook';

import PlumbConfig      from './conf/plumb';

const Component = {
    Orderbook,
    Imbalance,
    Aggregatebook
};

const GetComp = ( id, refs ) => {
    const c = refs[`c_${id}`];
    return c ? (Array.isArray( c ) ? c[0] : c) : null;
}

const GenID = () => Math.floor( (Math.random() * Date.now()) / 1000 );

export default {
    name: 'app',

    components: {
        VueDragResize,
        Orderbook,
        Imbalance,
        Aggregatebook
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

        this.comps.push({ id: `ob_${GenID()}`, component: 'Orderbook', config:{ asset: $asset.find('ibybit', 'BTCUSD') }, size: { width: 150, height: 300 }, outputs: [], inputs: 0 });
        this.comps.push({ id: `ob_${GenID()}`, component: 'Orderbook', config:{ asset: $asset.find('bitmex', 'XBTUSD') }, size: { width: 150, height: 300 }, outputs: [], inputs: 0  });
        
        this.comps.push({ id: `im_${GenID()}`, component: 'Imbalance', config:{}, size: { width: 150, height: 300 }, outputs: [], inputs: 0  });
        // this.comps.push({ id: `im_${GenID()}`, component: 'Imbalance', config:{}, size: { width: 150, height: 300 }, outputs: [], inputs: 0  });

        this.comps.push({ id: `ab_${GenID()}`, component: 'Aggregatebook', config:{ }, size: { width: 150, height: 300 }, outputs: [], inputs: 0 });

        setTimeout( () => {

            const obs = this.comps.filter( f => f.component == 'Orderbook' ).map( m => m.config.asset || {} );

            console.log( obs );


        }, 5000 );

        const lob1 = this.comps[0];
        const lob2 = this.comps[1];
        const imb1 = this.comps[2];
        // const imb2 = this.comps[3];

        const agg1 = this.comps[3];



        this.$nextTick( () => {

            jsPlumb.ready(() => {

                jsPlumb.bind("dblclick", c => {
                    jsPlumb.deleteConnection( c )
                });

                jsPlumb.bind("connection", (params, originalEvent) => {
                    
                    const tc = this.comps.find( f => f.id == params.targetId );
                    const sc = this.comps.find( f => f.id == params.sourceId );

                    const target = GetComp( params.targetId, this.$refs );
                    const source = GetComp( params.sourceId, this.$refs );

                    if ( !target || !source )  {
                        console.error(`Error finding component: `, target, source );
                        return false
                    }

                    sc.outputs.push( params.targetId );

                    return target.connect( params.sourceId, source.contract() );
                    

                });                

                jsPlumb.bind("connectionDetached", (params, originalEvent) => {

                    const tc = this.comps.find( f => f.id == params.targetId );
                    const sc = this.comps.find( f => f.id == params.sourceId );

                    const target = GetComp( params.targetId, this.$refs );
                    const source = GetComp( params.sourceId, this.$refs );

                    target.disconnect( params.sourceId, source.contract() );

                    // Remove this target from listeners
                    sc.outputs = sc.outputs.filter( f => f != params.targetId );

                });                

                jsPlumb.bind("connectionMoved", (params, originalEvent) => {

                    // Connection dragged back onto itself. Ignore.
                    if ( params.originalSourceId == params.newSourceId && params.originalTargetId == params.newTargetId )
                        return;

                    $print('MOVED => ', params );

                    // Source changed, target remains the same
                    if ( params.originalSourceId != params.newSourceId ) {

                        $print("Connection source changed - not handled")
                        return;
                    }

                    // Target changed, source is same
                    if ( params.originalTargetId != params.newTargetId ) {

                        const sourceId = params.newSourceId;

                        // const nt = this.comps.find( f => f.id == params.newTargetId );
                        // const ot = this.comps.find( f => f.id == params.originalTargetId );
                        const sc = this.comps.find( f => f.id == sourceId );
                        const otarget = GetComp( params.originalTargetId, this.$refs );
                        const ntarget = GetComp( params.newTargetId, this.$refs );
                        const source = GetComp( sourceId, this.$refs );

                        // Disconnect the original target, remove from source listeners
                        otarget.disconnect( sourceId, source.contract() );
                        sc.outputs = sc.outputs.filter( f => f != params.originalTargetId );

                        // Connect the new target
                        ntarget.connect( sourceId, source.contract() );
                        sc.outputs.push( params.targetId );

                        return;
                    }

                });                

                jsPlumb.importDefaults({
                    DragOptions: { cursor: 'hand', zIndex: 2000 },
                    PaintStyle: { stroke: '#666' },
                    EndpointHoverStyle: { fill: "orange" },
                    HoverPaintStyle: { stroke: "orange" },
                    Connector: [ "Flowchart", { /*stub: [40, 60],*/ gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
                    Endpoint: "Dot",
                    Anchors: "AutoDefault",
                    Container: "app",

                    ConnectionOverlays: [
                        [ "Arrow", {
                            location: 1,
                            id: "arrow",
                            length: 12,
                            width: 12,
                            foldback: 0.75
                        } ],
                    ]                    
                });

                let endpointconfig = Object.assign({}, PlumbConfig.endpoint.input, { maxConnections: 5  })

                jsPlumb.addEndpoint(lob1.id, PlumbConfig.endpoint.output );
                jsPlumb.addEndpoint(lob2.id, PlumbConfig.endpoint.output );
                jsPlumb.addEndpoint(imb1.id, endpointconfig );
                jsPlumb.addEndpoint(agg1.id, endpointconfig );



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

.jtk-endpoint {
    z-index: 1;
}

.jtk-connector {
    z-index: 0;
}


</style>
