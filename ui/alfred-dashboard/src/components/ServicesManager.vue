<template>
    <div class="services-manager">
        <div v-if="isLoading" style="text-align: center;">
            <md-spinner md-indeterminate></md-spinner>
        </div>
        <div v-else-if="error">  
            <md-icon class="md-warn">error</md-icon> An Error has occured
        </div>
        <div v-else>
            {{ msg }}
        </div>
    </div>
</template>

<script>
import {getServices} from '@/vuex/actions'
import { mapGetters } from 'vuex'

export default {
  name: 'services-manager',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  computed: {
    error () { return this.$store.state.services.error },
    services () { return this.$store.state.services.list },
    isLoading () { return this.$store.state.services.isLoading }
  },
  mounted: function () {
      getServices(this.$store);
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
</style>
