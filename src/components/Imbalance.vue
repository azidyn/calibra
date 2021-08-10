<template>
  
    <div>
        <Title :text="`Imbalance ${id}`"></Title>
        <div>
            {{ data }}
        </div>
    </div>

</template>


<script>

import Title from './common/Title.vue';

const Ports = {
    input: ['Orderbook'],
    output: 'TimeSeries'
};

export default {

    props: ['config', 'size', 'id'],

    components: { Title },

    data() {
        return { 
            data: null
        }
    },

    mounted() {

        $mitt.on(this.id, e => this.data = e.orderbook );

    },


    accept( component ) {

        if ( Ports.input.includes( component.ports().output ) ) {
            $print('accepted')
            return true;
        }

        $print('failed', component.ports(), Ports.input )
        return false;

    },

    ports() {
        return Ports;
    }

}
</script>

<style>

</style>