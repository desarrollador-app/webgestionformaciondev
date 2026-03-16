export const planEstadoMixin = {
    methods: {
        getPlanStatusColor(estado) {
            switch (estado) {
                case 'Concedido':
                    return 'success'
                case 'Solicitado':
                    return 'warning'
                case 'Cerrado':
                    return 'danger'
                case 'Reconfigurado':
                    return 'secondary'
                default:
                    return 'secondary'
            }
        }
    }
}

export const grupoEstadoMixin = {
    methods: {
        getGrupoStatusColor(estado) {
            switch (estado) {
                case 'Ejecutado':
                    return 'success'
                case 'En Ejecucion':
                    return 'info'
                case 'En Proyecto':
                    return 'warning'
                case 'Cancelado':
                    return 'danger'
                case 'Certificado':
                    return 'success'
                default:
                    return 'secondary'
            }
        }
    }
}

export const tareaEstadoMixin = {
    methods: {
        getTareaStatusColor(estado) {
            switch (estado) {
                case 'Pendiente':
                    return 'danger'
                case 'Completada':
                    return 'success'
                default:
                    return 'secondary'
            }
        }
    }
}