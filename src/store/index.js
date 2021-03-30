/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: Rex Joush
 * @Date: 2021-03-19 16:14:56
 * @LastEditors: Rex Joush
 * @LastEditTime: 2021-03-28 19:30:02
 */
import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'

import nodes from './modules/cluster/nodes'
import namespaces from './modules/cluster/namespaces'
import clusterRoles from './modules/cluster/clusterRoles'

import cronJobs from './modules/workload/cronJobs'
import daemonSets from './modules/workload/daemonSets'
import deployments from './modules/workload/deployments'
import jobs from './modules/workload/jobs'
import pods from './modules/workload/pods'
import replicaSets from './modules/workload/replicaSets'
import replicationControllers from './modules/workload/replicationControllers'
import statefulSets from './modules/workload/statefulSets'

import services from './modules/ExploreBalancing/services'
import ingresses from './modules/ExploreBalancing/ingresses'


Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    nodes,
    namespaces,

    cronJobs,
    daemonSets,
    deployments,
    jobs,
    pods,
    replicaSets,
    replicationControllers,
    statefulSets,
    
    services,
    ingresses,
    clusterRoles
  },
  getters
})

export default store