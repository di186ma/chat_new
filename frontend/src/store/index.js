import { createStore } from 'vuex'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default createStore({
  state: {
    rooms: [],
    currentRoom: null,
    messages: [],
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    socket: null
  },
  mutations: {
    setRooms(state, rooms) {
      state.rooms = rooms
    },
    addRoom(state, room) {
      state.rooms.push(room)
    },
    setCurrentRoom(state, room) {
      state.currentRoom = room
    },
    setMessages(state, messages) {
      state.messages = messages
    },
    addMessage(state, message) {
      state.messages.push(message)
    },
    setToken(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    setUser(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    setSocket(state, socket) {
      state.socket = socket
    }
  },
  actions: {
    async register({ commit }, { username, password, password2 }) {
      try {
        const response = await api.post('/api/register/', {
          username,
          password,
          password2
        })
        commit('setToken', response.data.access)
        commit('setUser', response.data.user)
        return response.data
      } catch (error) {
        console.error('Registration failed:', error)
        throw error
      }
    },
    async login({ commit }, { username, password }) {
      try {
        const response = await api.post('/api/login/', {
          username,
          password
        })
        commit('setToken', response.data.access)
        commit('setUser', response.data.user)
        return response.data
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },
    async fetchRooms({ commit }) {
      try {
        const response = await api.get('/api/rooms/')
        commit('setRooms', response.data)
      } catch (error) {
        console.error('Failed to load rooms:', error)
        throw error
      }
    },
    async createRoom({ commit }, roomName) {
      try {
        const response = await api.post('/api/rooms/', { name: roomName })
        commit('addRoom', response.data)
        return response.data
      } catch (error) {
        console.error('Failed to create room:', error)
        throw error
      }
    },
    async fetchMessages({ commit }, roomId) {
      try {
        const response = await api.get(`/api/rooms/${roomId}/messages/`)
        commit('setMessages', response.data)
      } catch (error) {
        console.error('Failed to load messages:', error)
        throw error
      }
    },
    async sendMessage({ commit }, { roomId, content }) {
      try {
        const response = await api.post(`/api/rooms/${roomId}/messages/`, { content })
        commit('addMessage', response.data)
        return response.data
      } catch (error) {
        console.error('Failed to send message:', error)
        throw error
      }
    },
    connectWebSocket({ commit, state }, roomName) {
      if (state.socket) {
        state.socket.close()
      }
      
      const socket = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/?token=${state.token}`)
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        commit('addMessage', data)
      }
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      socket.onclose = () => {
        console.log('WebSocket connection closed')
      }
      
      commit('setSocket', socket)
    }
  }
}) 