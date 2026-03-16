class CosteGrupoModel {
  constructor() {
    // Excluye id_coste e id_grupo (claves primarias/foráneas)
    this.updatableFields = [
      'cif',
      'directos',
      'indirectos',
      'organizacion',
      'salariales',
      'periodos_enero',
      'periodos_febrero',
      'periodos_marzo',
      'periodos_abril',
      'periodos_mayo',
      'periodos_junio',
      'periodos_julio',
      'periodos_agosto',
      'periodos_septiembre',
      'periodos_octubre',
      'periodos_noviembre',
      'periodos_diciembre'
    ];

    this.validations = {
      directos: (value) => {
        if (value === null || value === undefined) return true;
        return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
      },
      indirectos: (value) => {
        if (value === null || value === undefined) return true;
        return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
      },
      organizacion: (value) => {
        if (value === null || value === undefined) return true;
        return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
      },
      salariales: (value) => {
        if (value === null || value === undefined) return true;
        return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
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

module.exports = new CosteGrupoModel();
