const { ESTADO_TAREA } = require('../utils/constants');

class TareaModel {
  constructor() {
    // Excluye id_tarea y relaciones con otras entidades
    this.updatableFields = [
      'id_grupo',
      'nombre_tarea',
      'estado',
      'observaciones',
      'autor_azure_id',
      'responsable_azure_id',
      // Añado los campos fecha_vencimiento y color
      'fecha_vencimiento',
      'color'
    ];

    // Añado color para poder validarlo
    this.validations = {
      estado: (value) => {
        if (!value) return true;
        const validEstados = Object.values(ESTADO_TAREA);
        return validEstados.includes(value);
      },
      color: (value) => {
        if (!value) return true;
        return ['rojo', 'amarillo', 'verde', 'azul'].includes(value);
      }
    };
  }

  getUpdatableFields() {
    return this.updatableFields;
  }

  validate(data) {
    const errors = [];
    
    Object.keys(data).forEach(field => {
      if (this.validations[field] && !this.validations[field](data[field])) {
        errors.push(`Campo ${field} tiene un valor inválido`);
      }
    });
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new TareaModel();
