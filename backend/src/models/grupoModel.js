const { ESTADOS_GRUPO } = require('../utils/constants');

class GrupoModel {
	constructor() {
		// Excluye id_grupo y relaciones con otras entidades
		this.updatableFields = [
			'estado',
			'codigo',
			'fecha_inicio',
			'fecha_fin',
			'denominacion',
			'responsable',
			'telefono_responsable',
			'observaciones',
			'centro_cif',
			'centro_nombre',
			'centro_direccion',
			'centro_codPostal',
			'centro_localidad',
			'lugar_imparticion_cif',
			'lugar_imparticion_nombre',
			'lugar_imparticion_direccion',
			'lugar_imparticion_codPostal',
			'lugar_imparticion_localidad',
			'horas_totales_presencial_horario',
			'hora_inicio_tramo1_presencial_horario',
			'hora_fin_tramo1_presencial_horario',
			'hora_inicio_tramo2_presencial_horario',
			'hora_fin_tramo2_presencial_horario',
			'dias_presencial_horario',
			'aula_virtual',
			'medio_aula_virtual',
			'conexion_aula_virtual',
			'contacto_aula_virtual',
			'telefono_aula_virtual',
			'bimodal_aula_virtual',
			'sin_participantes_en_centro_aula_virtual',
			'sin_docentes_en_centro_aula_virtual',
			'tele_centro_cif',
			'tele_centro_nombre',
			'tele_centro_direccion',
			'tele_centro_codPostal',
			'tele_centro_localidad',
			'tele_telefono',
			'horas_totales_teleformacion',
			'hora_inicio_tramo1_tele',
			'hora_fin_tramo1_tele',
			'hora_inicio_tramo2_tele',
			'hora_fin_tramo2_tele',
			'dias_tele',
			'id_accion',
			'moodle_grupo_id',
			'num_homologacion_seguridad',
			'lugar_fecha_diploma',
			'tipo_bonificacion', // Añadimos el campo tipo_bonificación
    		'max_alumnos'		// Añadimos el campo max_alumnos
		];

		this.validations = {
			estado: (value) => {
				if (!value) return true;
				const validEstados = Object.values(ESTADOS_GRUPO);
				return validEstados.includes(value);
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

module.exports = new GrupoModel();
