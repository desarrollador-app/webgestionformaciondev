const { TIPO_DOCUMENTO, NIVEL_ESTUDIOS, CATEGORIA_PROFESIONAL } = require('../utils/constants');

class PersonaModel {
  constructor() {
    // Excluye id_persona y relaciones con otras entidades
    this.updatableFields = [
      'nombre',
      'apellido1',
      'apellido2',
      'documento',
      'tipoDocumento',
      'correoElectronico',
      'telefono',
      'NSS',
      'es_docente',
      'es_alumno',
      'fecha_nacimiento',
      'sexo',
      'domicilio',
      'discapacidad',
      'afectadosTerrorismo',
      'afectadosViolenciaGenero',
      'nivel_estudios',
      'comentarios'
    ];

    this.validations = {
      tipoDocumento: (value) => {
        if (!value) return true;
        const validTipos = Object.values(TIPO_DOCUMENTO);
        return validTipos.includes(value);
      },
      nivel_estudios: (value) => {
        if (!value) return true;
        const validNiveles = Object.values(NIVEL_ESTUDIOS);
        return validNiveles.includes(value);
      },
      categoria_profesional: (value) => {
        if (!value) return true;
        const validCategorias = Object.values(CATEGORIA_PROFESIONAL);
        return validCategorias.includes(value);
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

module.exports = new PersonaModel();
