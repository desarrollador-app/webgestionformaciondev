import { defineStore } from 'pinia';
import { getGroupUsers } from '../services/msGraphService.js';

const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:3000' 
  : window.location.origin;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false, 
    user: null,
    isLoading: false,
    error: null,
    isInitialized: false, 
    responsables: []
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    hasError: (state) => !!state.error,
    getResponsables: (state) => state.responsables
  },

 
  actions: {
    async initialize() {
    this.user = {
      id: 1,
      nombre: "Dev",
      email: "dev@local"
    }

    this.isAuthenticated = true
    this.isInitialized = true
    },

    /** 
    async initialize() {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/check`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          this.isAuthenticated = data.authenticated;
          this.user = data.user || null;
          
          // Si el usuario está autenticado, cargar responsables
          if (this.isAuthenticated) {
            await this.loadResponsables();
          }
        } else {
          this.isAuthenticated = false;
          this.user = null;
          this.responsables = [];
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        this.error = error.message;
        this.isAuthenticated = false;
        this.user = null;
        this.responsables = [];
      } finally {
        this.isLoading = false;
        this.isInitialized = true;
      }
    }, */

    async login() {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`);
        const data = await response.json();
        window.location.href = data.authUrl;
      } catch (error) {
        console.error('Error durante el login:', error);
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          this.isAuthenticated = false;
          this.user = null;
          this.clearResponsables();
          
          if (data.logoutUrl) {
            window.location.href = data.logoutUrl;
          } else {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Error durante el logout:', error);
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    async updateAuthState() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/check`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          this.isAuthenticated = data.authenticated;
          this.user = data.user || null;
        } else {
          this.isAuthenticated = false;
          this.user = null;
          this.clearResponsables();
        }
      } catch (error) {
        console.error('Error actualizando estado de autenticación:', error);
        this.isAuthenticated = false;
        this.user = null;
        this.clearResponsables();
      }
    },

    clearError() {
      this.error = null;
    },

    /**
     * Carga los responsables desde la API y los guarda en localStorage
     */
    async loadResponsables() {
      try {
        // Primero intentar cargar desde localStorage
        const cachedResponsables = this.getResponsablesFromStorage();
        if (cachedResponsables && cachedResponsables.length > 0) {
          this.responsables = cachedResponsables;
          return;
        }

        // Si no hay datos en localStorage, cargar desde la API
        const response = await getGroupUsers();
        
        if (response.success) {
          this.responsables = response.data.users;
          this.saveResponsablesToStorage(response.data.users);
          console.log('Responsables cargados desde API y guardados en localStorage:', response.data.users.length);
        } else {
          console.error('Error cargando responsables:', response.message);
          this.responsables = [];
        }
      } catch (error) {
        console.error('Error cargando responsables:', error);
        this.responsables = [];
      }
    },

    /**
     * Obtiene los responsables desde localStorage
     */
    getResponsablesFromStorage() {
      try {
        const responsables = localStorage.getItem('responsables');
        return responsables ? JSON.parse(responsables) : null;
      } catch (error) {
        console.error('Error leyendo responsables desde localStorage:', error);
        return null;
      }
    },

    /**
     * Guarda los responsables en localStorage
     */
    saveResponsablesToStorage(responsables) {
      try {
        localStorage.setItem('responsables', JSON.stringify(responsables));
      } catch (error) {
        console.error('Error guardando responsables en localStorage:', error);
      }
    },

    /**
     * Limpia los responsables del localStorage y del estado
     */
    clearResponsables() {
      this.responsables = [];
      localStorage.removeItem('responsables');
    }
  }
});
