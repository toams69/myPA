import axios from 'axios'

const alfredWS = "";
const alfredRootPath = "/alfred-api";

export const getServices = ({commit}) => {
    commit('GET_SERVICES');
    setTimeout(() => {
        axios.get(alfredRootPath + '/services').then((response) => {
            commit('GET_SERVICES_SUCCEED', { list: response.data })
        }, (err) => {
            commit('GET_SERVICES_FAILED', err)
        });
    }, 5000);
}


// TODO Real time notification (socketIO / WS ?)