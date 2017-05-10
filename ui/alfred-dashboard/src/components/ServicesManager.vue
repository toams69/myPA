<template>
     <md-card class="card">
        <md-card-area md-inset>
            <md-card-header>
                <h2 class="md-title">Services Available</h2>
                <div class="md-subhead">
                    
                </div>
            </md-card-header>
            <md-card-content>
                This represents all services currently connected to Alfred
            </md-card-content>
        </md-card-area>
        <md-card-content>
            <div v-if="isLoading" style="text-align: center;">
                <md-spinner md-indeterminate></md-spinner>
            </div>
            <div v-else-if="error">  
                <md-icon class="md-warn">error</md-icon> An Error has occured
            </div>
            <div v-else>
                {{ msg }}
            </div>
        </md-card-content>
        <md-card-actions>
            <md-button v-on:click="onRefreshClicked">Refresh</md-button>
        </md-card-actions>
    </md-card>
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
  
  methods: {
      onRefreshClicked(e) {
        getServices(this.$store);
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
