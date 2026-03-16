import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
	state: () => ({
		activePlan: null,
		activeAccionFormativa: null,
		activeGrupo: null,
		activeEmpresa: null,
		activePersona: null,
		tipoModalidadSesiones: null
	}),
	actions: {
		setActivePlan(plan) {
			this.activePlan = plan
		},
		setActiveAccionFormativa(accionFormativa) {
			this.activeAccionFormativa = accionFormativa
		},
		setActiveGrupo(grupo) {
			this.activeGrupo = grupo
		},
		setActiveEmpresa(empresa) {
			this.activeEmpresa = empresa
		},
		setActivePersona(persona) {
			this.activePersona = persona
		},
		setTipoModalidadSesiones(tipoModalidad) {
			this.tipoModalidadSesiones = tipoModalidad
		},
		clearActivePlan() {
			this.activePlan = null
		},
		clearActiveState() {
			this.activePlan = null
			this.activeAccionFormativa = null
			this.activeGrupo = null
			this.activeEmpresa = null
			this.activePersona = null
			this.tipoModalidadSesiones = null
		},
	},
	persist: {
		key: 'praxis-store',
		storage: localStorage,
		paths: ['activePlan', 'activeAccionFormativa', 'activeGrupo', 'activeEmpresa', 'activePersona', 'tipoModalidadSesiones']
	}
})
