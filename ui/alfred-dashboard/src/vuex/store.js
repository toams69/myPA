import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
   services: {
       list: [],
       isLoading: false,
       error: null 
   }
}

const mutations = {
     GET_SERVICES() {
        state.services.isLoading = true;
        state.services.error = null;
    },
    GET_SERVICES_SUCCEED() {
        state.services.isLoading = false;
        state.services.error = null;
    },
    GET_SERVICES_FAILED(error) {
        state.services.error = "An error as occured";
        state.services.isLoading = false;
    },
    SERVICE_STATE_CHANGED(service) {

    }


}

export default new Vuex.Store({
  state,
  mutations
})