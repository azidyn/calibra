
export const Connection = {

    data() {
        return { 
            connections: {
                inputs: {}, outputs: {} 
            }
        }
    },

    computed: {

        ainputs() {
            return Object.keys( this.connections.inputs );
        },
        
        aoutputs() {
            return Object.keys( this.connections.outputs );
        },        

    },

    methods: {

        /* 
          
            Handles the managemet of 'physical' connections
            between components

        */

        /* New source input connected to this comp */
        _input( opts ) {
            this.$set( this.connections.inputs, opts.sourceId, opts.connection );
            if ( this.input )
                this.input( opts );
        },

        /* Input disconnected from this comp */
        _xinput( sourceId ) {
            this.$delete( this.connections.inputs, sourceId );
            if ( this.xinput )
                this.xinput( sourceId );
        },

        _output( opts ) {
            this.$set( this.connections.outputs, opts.targetId, opts.connection );
            if ( this.output )
                this.output( opts );
        },

        _xoutput( targetId ) {
            this.$delete( this.connections.outputs, targetId );
            if ( this.xoutput )
                this.xoutput( targetId );
        },
                     

    },

};

