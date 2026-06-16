import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    adminInfo: null
  },
  mutations: {
    SET_ADMIN_INFO(state, info) {
      state.adminInfo = info
      localStorage.setItem('adminInfo', JSON.stringify(info))
    },
    CLEAR_ADMIN_INFO(state) {
      state.adminInfo = null
      localStorage.removeItem('adminInfo')
    }
  },
  actions: {
    setAdminInfo({ commit }, info) {
      commit('SET_ADMIN_INFO', info)
    },
    clearAdminInfo({ commit }) {
      commit('CLEAR_ADMIN_INFO')
    },
    // 从 localStorage 恢复登录状态
    restoreLogin({ commit }) {
      const stored = localStorage.getItem('adminInfo')
      if (stored) {
        try {
          const info = JSON.parse(stored)
          commit('SET_ADMIN_INFO', info)
          return info
        } catch (e) {
          console.error('恢复登录状态失败:', e)
        }
      }
      return null
    }
  },
  getters: {
    isLoggedIn: state => !!state.adminInfo,
    adminInfo: state => state.adminInfo,
    userType: state => state.adminInfo?.userType || 'admin',
    adminType: state => state.adminInfo?.adminType
  }
})