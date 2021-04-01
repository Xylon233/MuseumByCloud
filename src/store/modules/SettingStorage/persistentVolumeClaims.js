/*
 * @Description: your project
 * @version: 1.0
 * @Author: Anna667
 * @Date: 2021-03-29 11:11:03
 * @LastEditors: Anna667
 * @LastEditTime: 2021-03-29 11:11:03
 */
import { getAllPVC } from '@/api/SettingStorage/persistentVolumeClaims'
import { getToken } from '@/utils/auth'

const getDefaultState = () => {
    return {
        token: getToken(),
        name: '',
        avatar: ''
    }
}

const state = getDefaultState()

const mutations = {

}

const actions = {
    // getAllPVC
    getAllPVC({ commit }) {
        return new Promise((resolve, reject) => {
            getAllPVC().then(response => {
                const { data } = response
                if (!data) {
                    return reject('获取失败')
                }
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
