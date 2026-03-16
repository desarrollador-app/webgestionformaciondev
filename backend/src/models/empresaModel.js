class EmpresaModel {
  constructor() {
    // Excluye id_empresa y relaciones con otras entidades
    this.updatableFields = [
      'razon_social',
      'CIF',
      'NSS',
      'direccion',
      'persona_contacto',
      'telefono1',
      'telefono2',
      'fax',
      'sector_actividad',
      'CNAE',
      'CNAE2009',
      'correo_electronico',
      'pagina_web',
      'nombre_representante',
      'NIF_representante',
      'informa_RLT',
      'valor_informe',
      'fecha_discrepancia',
      'resuelto',
      'comentarios'
    ];

    this.validations = {
      // Por ahora no hay validaciones específicas de enums para empresas
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

module.exports = new EmpresaModel();
