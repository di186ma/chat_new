import { createStore } from 'vuex';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default createStore({
  state: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    error: null
  },
  getters: {
    isAuthenticated: state => !!state.token,
    error: state => state.error,
    user: state => state.user
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    clearToken(state) {
      state.token = null;
      localStorage.removeItem('token');
    },
    setUser(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    clearUser(state) {
      state.user = null;
      localStorage.removeItem('user');
    },
    setError(state, error) {
      state.error = error;
    },
    clearError(state) {
      state.error = null;
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        commit('clearError');
        const response = await axios.post(`${API_URL}/login/`, credentials);
        commit('setToken', response.data.access);
        commit('setUser', response.data.user);
        
        // Для отладки
        console.log('Logged in user:', response.data.user);
        
        return response.data;
      } catch (error) {
        commit('setError', error.response?.data?.error || 'Ошибка входа');
        throw error;
      }
    },
    async register({ commit }, userData) {
      try {
        commit('clearError');
        await axios.post(`${API_URL}/register/`, userData);
      } catch (error) {
        commit('setError', error.response?.data?.error || 'Ошибка регистрации');
        throw error;
      }
    },
    logout({ commit }) {
      commit('clearToken');
      commit('clearUser');
      commit('clearError');
    },
    async fetchRooms({ commit }) {
      try {
        commit('clearError');
        const response = await axios.get(`${API_URL}/rooms/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        return response.data;
      } catch (error) {
        commit('setError', error.response?.data?.error || 'Ошибка загрузки комнат');
        throw error;
      }
    },
    async createRoom({ commit, dispatch }, roomName) {
      try {
        commit('clearError');
        await axios.post(`${API_URL}/rooms/`, {
          name: roomName
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        return dispatch('fetchRooms');
      } catch (error) {
        commit('setError', error.response?.data?.error || 'Ошибка создания комнаты');
        throw error;
      }
    }
  }
}); 