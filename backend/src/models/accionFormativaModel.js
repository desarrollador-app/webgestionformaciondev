const { MODALIDAD_SESIONES, NIVEL_FORMACION } = require('../utils/constants');

class AccionFormativaModel {
	constructor() {
		// Excluye id_accion y relaciones con otras entidades
		this.updatableFields = [
			'denominacion',
			'numero_accion',
			'modalidad',
			'id_area',
			'id_desglose',
			'codigo_grupo_accion',
			'horas_modalidad_presencial',
			'horas_modalidad_teleformacion',
			'cif_plataforma',
			'razon_social_plataforma',
			'uri',
			'usuario',
			'password',
			'observaciones',
			'nivel_formacion',
			'objetivos',
			'contenido',
			'participantes',
			'id_plan',
			'es_seguridad_privada',
			'horas_totales_diploma',
			'desglose_horas_diploma',
			'modalidad_diploma'
		];

		this.validations = {
			modalidad: (value) => {
				const validModalidades = Object.values(MODALIDAD_SESIONES);
				return validModalidades.includes(value);
			},
			nivel_formacion: (value) => {
				const validNiveles = Object.values(NIVEL_FORMACION);
				return !value || validNiveles.includes(value);
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

module.exports = new AccionFormativaModel();
