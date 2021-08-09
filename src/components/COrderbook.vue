<template>
    <div>
        <div>
            {{ 'whatever' }}
        </div>
        <div>
            {{ source }}
        </div>
    </div>
</template>

<script>

import VueDragResize from 'vue-drag-resize';

export default {    
    components: { VueDragResize },
    props: ['source'],

    watch: {
        source() {
            console.log( 'source changed!', this.source );
        }
    },

    mounted() {

        // if ( this.source && this.source.title == 'test 123' )
        //     setTimeout(()=> this.$emit('interact', { data: 'hello from component' }), 5000 )

    }

}
</script>

<style>

</style>