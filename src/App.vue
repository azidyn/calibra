<template>
    <div id="app">

        <VueDragResize v-for="(w, index) in comps" 
            :key="index" 
            :w="w.size.width" 
            :h="w.size.height" 
            v-on:resizing="n => resize(n, w)" 
            v-on:dragging="n => resize(n, w)" 
            v-on:clicked=" n => click(n,w) "
            :id="w.id" 
            
            :sticks="['br']"
            style="background:#ccc; z-index: 1"
        >
            <!-- :isActive="w.active"
            :preventActiveBehavior="true" -->
        <!-- dragHandle=".drag"  -->
        <!-- :isActive="w.active" -->
                <component 
                    class="noselect"
                    :ref="`c_${w.id}`"
                    :is="w.component"  
                    :config="w.config" 
                    :size="w.size" 
                    :id="w.id" 
                    :inputs="w.inputs"
                    :outputs="w.outputs"
                    @cleartargets="cleartargets( w.outputs )"
                >
                </component>

        </VueDragResize>

    </div>
</template>

<script>
import VueDragResize from 'vue-drag-resize';

import Orderbook        from './components/Orderbook';
import Imbalance        from './components/Imbalance';
import LobDeltas        from './components/LobDeltas';
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
        LobDeltas,
        Aggregatebook
    },

    data() {
        return {
            init: false,
            clock: {
                handle: null,
                frequency: 100
            },
            comps: [],
        }
    },

    methods: {

        // Comp signalled to disconnect all of it's connections
        cleartargets( outputs ) {

            // $print('wiping conenctions:', outputs )

            for ( const o of outputs ) {
                // console.log( o.connection )
                jsPlumb.deleteConnection( o.connection )
            }
                

        },

        click( event, comp ) {
            return;
            
            // $print(o,n)
            
            for ( const c of this.comps )
                c.active = false;
            
            this.$nextTick( () => comp.active = true );

        },

        resize(newRect, win) {

            win.size.width = newRect.width;
            win.size.height = newRect.height;

            for ( const i of this.comps )
                jsPlumb.revalidate( i.id );

        },

        clockreset() {

            if ( this.clock.handle )
                clearInterval( this.clock.handle );

            this.clock.handle = setInterval( () => $mitt.emit('*:clock'), this.clock.frequency );

        }
    },

    mounted() {

        this.clockreset();

        this.comps.push({ id: `ob_${GenID()}`, component: 'Orderbook',  config:{ asset: $asset.find('bitmex', 'XBTUSD') }, size: { width: 150, height: 300 }, outputs: [], inputs: 0 });
        // this.comps.push({ id: `ob_${GenID()}`, component: 'Orderbook', active:false, config:{ asset: $asset.find('ibybit', 'BTCUSD') }, size: { width: 150, height: 300 }, outputs: [], inputs: 0  });
        
        this.comps.push({ id: `im_${GenID()}`, component: 'Imbalance',  config:{}, size: { width: 150, height: 300 }, outputs: [], inputs: 0  });
        this.comps.push({ id: `ld_${GenID()}`, component: 'LobDeltas',  config:{}, size: { width: 150, height: 300 }, outputs: [], inputs: 0  });


        this.comps.push({ id: `ab_${GenID()}`, component: 'Aggregatebook',  config:{ }, size: { width: 150, height: 300 }, outputs: [], inputs: 0 });




        const lob1 = this.comps[0];
        // const lob2 = this.comps[1];
        const imb1 = this.comps[1];

        const agg1 = this.comps[2];

        const lobdel = this.comps[3];



        this.$nextTick( () => {

            jsPlumb.ready(() => {

                jsPlumb.bind("dblclick", c => {
                    jsPlumb.deleteConnection( c )
                });

                jsPlumb.bind("connection", (params, originalEvent) => {

                    // const tc = this.comps.find( f => f.id == params.targetId );
                    // const sc = this.comps.find( f => f.id == params.sourceId );

                    const target = GetComp( params.targetId, this.$refs );
                    const source = GetComp( params.sourceId, this.$refs );

                    if ( !target || !source )  {
                        console.error(`Error finding component: `, target, source );
                        return false
                    }

                    // sc.outputs.push({ connection: params.connection, targetId: params.targetId });

                    target._input({ sourceId: params.sourceId, connection: params.connection });
                    source._output({ targetId: params.targetId, connection: params.connection });

                    // return target.connect( params.sourceId, source.contract() );

                });                

                jsPlumb.bind("connectionDetached", (params, originalEvent) => {

                    
                    const tc = this.comps.find( f => f.id == params.targetId );
                    const sc = this.comps.find( f => f.id == params.sourceId );

                    const target = GetComp( params.targetId, this.$refs );
                    const source = GetComp( params.sourceId, this.$refs );

                    // target.disconnect( params.sourceId, source.contract() );
                    target._xinput( params.sourceId );
                    source._xoutput( params.targetId );

                    // Remove this target from listeners
                    // sc.outputs = sc.outputs.filter( f => f.targetId != params.targetId );

                    


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

                        $print('MOVED => moved sources target ');

                        // const nt = this.comps.find( f => f.id == params.newTargetId );
                        // const ot = this.comps.find( f => f.id == params.originalTargetId );
                        const sc = this.comps.find( f => f.id == sourceId );
                        const otarget = GetComp( params.originalTargetId, this.$refs );
                        const ntarget = GetComp( params.newTargetId, this.$refs );
                        const source = GetComp( sourceId, this.$refs );

                        // Disconnect the original target, remove from source listeners
                        otarget.disconnect( sourceId, source.contract() );
                        sc.outputs = sc.outputs.filter( f => f.targetId != params.originalTargetId );

                        // Connect the new target
                        ntarget.connect( sourceId, source.contract() );

                        // sc.outputs will be updated in the 'connection' event 

                        return;
                    }

                });                

                jsPlumb.importDefaults({
                    DragOptions: { cursor: 'hand', zIndex: 2000 },
                    PaintStyle: { stroke: '#666' },
                    EndpointHoverStyle: { fill: "orange" },
                    HoverPaintStyle: { stroke: "orange" },
                    Connector: [ "Straight", { /*stub: [40, 60],*/ gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
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

                let endpointconfig = Object.assign({}, PlumbConfig.endpoint.input, { 

                    maxConnections: 5,

                    beforeDrop: params => {

                        // const tc = this.comps.find( f => f.id == params.targetId );
                        // const sc = this.comps.find( f => f.id == params.sourceId );
                        
                        const target = GetComp( params.targetId, this.$refs );
                        const source = GetComp( params.sourceId, this.$refs );

                        if ( !target || !source )  {
                            console.error(`Error finding component: `, target, source );
                            return false
                        }

                        // Check this input is compatible with the target 
                        const verify = target.verify( source.contract(), params.sourceId );

                        if ( !verify.success ) { 
                            if ( verify.error )
                                alert( verify.error );
                            if ( verify.warn )
                                $print( verify.warn );
                        }
                        
                        return verify.success;

                    }
                
                });


                jsPlumb.addEndpoint(lob1.id, PlumbConfig.endpoint.output );
                // jsPlumb.addEndpoint(lob2.id, PlumbConfig.endpoint.output );
                jsPlumb.addEndpoint(imb1.id, endpointconfig );
                jsPlumb.addEndpoint(lobdel.id, endpointconfig );

                jsPlumb.addEndpoint(agg1.id, PlumbConfig.endpoint.output );
                jsPlumb.addEndpoint(agg1.id, endpointconfig );



            });
        });


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
