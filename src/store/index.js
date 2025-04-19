import { createStore } from 'vuex';
import axios from 'axios';

const API_URL = '/api';

export default createStore({
  state: {
    token: localStorage.getItem('token') || null,
    user: (() => {
      try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
      } catch (e) {
        console.error('Ошибка при парсинге данных пользователя:', e);
        localStorage.removeItem('user');
        return null;
      }
    })(),
    rooms: [],
    error: null
  },
  getters: {
    isAuthenticated: state => !!state.token,
    error: state => state.error,
    user: state => state.user,
    rooms: state => state.rooms
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
    },
    setRooms(state, rooms) {
      state.rooms = rooms;
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        commit('clearError');
        const response = await axios.post(`${API_URL}/token/`, credentials);
        const { access, refresh, user } = response.data;
        commit('setToken', access);
        commit('setUser', user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        // Для отладки
        console.log('Logged in user:', user);
        
        return response.data;
      } catch (error) {
        commit('setError', error.response?.data?.error || 'Ошибка входа');
        throw error;
      }
    },
    async register({ commit }, userData) {
      try {
        commit('clearError');
        const response = await axios.post(`${API_URL}/register/`, userData);
        return response.data;
      } catch (error) {
        commit('setError', error.response?.data?.error || 'Ошибка регистрации');
        throw error;
      }
    },
    logout({ commit }) {
      commit('clearAuth');
      delete axios.defaults.headers.common['Authorization'];
    },
    async loadRooms({ commit }) {
      try {
        commit('clearError');
        const response = await axios.get(`${API_URL}/rooms/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        commit('setRooms', response.data);
        return response;
      } catch (error) {
        commit('setError', error.response?.data?.error || 'Ошибка загрузки комнат');
        throw error;
      }
    },
    async createRoom({ commit, dispatch }, roomName) {
      try {
        commit('clearError');
        const response = await axios.post(`${API_URL}/rooms/`, { name: roomName }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        await dispatch('loadRooms');
        return response.data;
      } catch (error) {
        commit('setError', error.response?.data?.error || 'Ошибка создания комнаты');
        throw error;
      }
    }
  }
}); 