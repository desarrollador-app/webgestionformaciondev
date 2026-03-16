const { ESTADOS_PLAN, TIPO_BONIFICACION } = require('../utils/constants');

class PlanModel {
  constructor() {
    // Excluye id_plan y relaciones con otras entidades
    this.updatableFields = [
      'expediente',
      'estado',
      'nombre',
      'solicitante',
      'fecha_convocatoria_plan',
      'responsable',
      'fecha_inicio',
      'fecha_fin',
      'tipo_bonificacion'
    ];


    this.validations = {
      estado: (value) => {
        const validStates = Object.values(ESTADOS_PLAN);
        return validStates.includes(value);
      },
      tipo_bonificacion: (value) => {
        const validTypes = Object.values(TIPO_BONIFICACION);
        return !value || validTypes.includes(value);
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

module.exports = new PlanModel();
