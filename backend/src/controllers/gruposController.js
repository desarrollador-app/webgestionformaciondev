const prisma = require('../db');
const grupoModel = require('../models/grupoModel');
const { MODALIDAD_DOCENTE, ESTADO_CURSO } = require('../utils/constants');
const pdfService = require('../services/pdfService');
const { getUsuarioNombre, truncateString } = require('../utils/utils');
const archiver = require('archiver'); //Importamos 'archiver' para poder comprimir los múltiples PDFs en un archivo ZIP
/**
 * Genera y sirve el diploma en PDF de un alumno especifico.
 * Utiliza Prisma para obtener los datos y PDF Service para la generación visual
 */
const downloadDiplomasIndividual = async (req, res) =>{
	 try {
    const { id, id_alumno } = req.params;

    // Buscamos el registro del alumno en el grupo incluyendo su información personal
    // y los detalles de la acción formativa asociada al grupo.
    const alumnoGrupo = await prisma.alumnosPersonaGrupo.findUnique({
      where: { id_alumno_grupo: parseInt(id_alumno) },
      include: {
        persona: true,
        grupo: {
          include: { accionFormativa: true }
        }
      }
    });

    // Validación de existencia del registro
    if (!alumnoGrupo) return res.status(404).json({ error: 'Alumno no encontrado' });

    const grupo = alumnoGrupo.grupo;

    // Mapeamos los datos del alumno al formato que espera el generador de PDFs
    const alumnoData = {
      nombre: `${alumnoGrupo.persona.nombre || ''} ${alumnoGrupo.persona.apellido1 || ''} ${alumnoGrupo.persona.apellido2 || ''}`.trim(),
      documento: alumnoGrupo.persona.documento || 'Sin NIF'
    };

    // Mapeamos los datos del curso/grupo, gestionando posibles nulos y valores por defecto
    const grupoData = {
      denominacion: grupo.accionFormativa?.denominacion || grupo.denominacion || 'Curso de Praxis',
      horas: grupo.accionFormativa?.horas_modalidad_presencial || grupo.accionFormativa?.horas_modalidad_teleformacion || 0,
      modalidad: grupo.accionFormativa?.modalidad || 'Presencial',
      modalidadDiploma: grupo.accionFormativa?.modalidad_diploma || '',
      desgloseHorasDiploma: grupo.accionFormativa?.desglose_horas_diploma || '',
      lugarFechaDiploma: `A Coruña, a ${new Date().toLocaleDateString('es-ES')}`,
      centro: grupo.centro_nombre || 'CENTRO DE FORMACIÓN PRAXIS',
      direccion: grupo.centro_direccion || 'Avda. de Oza, 16, 15006 A Coruña'
    };
// Llamamos al servicio de PDF para generar el buffer (el archivo en memoria)
const pdfBuffer = await pdfService.generateDiplomaFront(alumnoData, grupoData);

// Formateamos el nombre del archivo final
const fileName = `Diploma_${alumnoData.nombre.replace(/\s+/g, '_')}.pdf`;

// Configuramos las cabeceras HTTP para indicar al navegador que es un PDF y forzar descarga
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
res.setHeader('Content-Length', pdfBuffer.length);

// Enviamos el chorro de datos (buffer) al cliente
res.send(pdfBuffer);

} catch (error) {
  console.error('Error al generar diploma individual:', error);
  res.status(500).json({ error: 'Error interno al procesar el diploma' });
} 
};
/**
 * Genera un archivo ZIP que empaqueta todos los diplomas del grupo actual.
 * Filtra automáticamente a los alumnos con estado "No Participa".
 */
const downloadDiplomasMasivo = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtenemos el grupo y su lista de alumnos participantes (excluyendo bajas/no participantes)
    const grupo = await prisma.grupos.findUnique({
      where: { id_grupo: parseInt(id) },
      include: {
        accionFormativa: true,
        alumnosPersonaGrupo: {
          where: { estado_curso: { not: ESTADO_CURSO.NO_PARTICIPA } },
          include: { persona: true }
        }
      }
    });

    // Validación de seguridad: si no hay alumnos, no tiene sentido generar un ZIP vacío
    if (!grupo || !grupo.alumnosPersonaGrupo || grupo.alumnosPersonaGrupo.length === 0) {
      return res.status(400).json({ error: 'El grupo no tiene alumnos participantes para generar diplomas' });
    }

    // Preparamos las cabeceras para un archivo de tipo ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="Diplomas_Grupo_${grupo.codigo || id}.zip"`);

    // Inicializamos el archivador (empaquetador) y lo conectamos directamente a la respuesta HTTP
    const archive = archiver('zip', { zlib: { level: 9 } }); // Nivel 9 = Máxima compresión
    archive.pipe(res);

    // Datos comunes del curso que se repetirán en todos los diplomas
    const grupoData = {
      denominacion: grupo.accionFormativa?.denominacion || grupo.denominacion || 'Curso de Praxis',
      horas: grupo.accionFormativa?.horas_modalidad_presencial || grupo.accionFormativa?.horas_modalidad_teleformacion || 0,
      modalidad: grupo.accionFormativa?.modalidad || 'Presencial',
      modalidadDiploma: grupo.accionFormativa?.modalidad_diploma || '',
      desgloseHorasDiploma: grupo.accionFormativa?.desglose_horas_diploma || '',
      lugarFechaDiploma: `A Coruña, a ${new Date().toLocaleDateString('es-ES')}`,
      centro: grupo.centro_nombre || 'CENTRO DE FORMACIÓN PRAXIS',
      direccion: grupo.centro_direccion || 'Avda. de Oza, 16, 15006 A Coruña'
    };
// Iteramos por cada alumno, generamos su PDF individual y lo inyectamos en el archivo ZIP
for (const alumnoGrupo of grupo.alumnosPersonaGrupo) {
  const alumnoData = {
    nombre: `${alumnoGrupo.persona.nombre || ''} ${alumnoGrupo.persona.apellido1 || ''} ${alumnoGrupo.persona.apellido2 || ''}`.trim(),
    documento: alumnoGrupo.persona.documento || 'Sin NIF'
  };

  // Generamos el buffer del PDF para este alumno concreto
  const pdfBuffer = await pdfService.generateDiplomaFront(alumnoData, grupoData);

  // Añadimos el buffer al archivador con un nombre de archivo único dentro del ZIP
  const internalFileName = `Diploma_${alumnoData.nombre.replace(/\s+/g, '_')}.pdf`;
  archive.append(pdfBuffer, { name: internalFileName });
}

// Finalizamos el proceso de compresión. Esto cierra el stream y completa la descarga.
await archive.finalize();

} catch (error) {
  console.error('Error al generar descarga masiva de diplomas:', error);
  // Si el stream de datos ya ha comenzado, no podemos enviar una respuesta JSON normal
  if (!res.headersSent) {
    res.status(500).json({ error: 'Error crítico al generar el archivo ZIP de diplomas' });
  }
}
};

/**
 * Filtra los datos de actualización basándose en los campos permitidos
 * @param {Object} data - Datos a filtrar
 * @returns {Object} Datos filtrados
 */
const filterUpdateData = (data) => {
	const updatableFields = grupoModel.getUpdatableFields();
	const filteredData = {};

	updatableFields.forEach(field => {
		if (data[field] !== undefined) {
			filteredData[field] = data[field];
		}
	});

	return filteredData;
};

// Función auxiliar para obtener el siguiente código de grupo disponible
const getNextGroupCode = async (idAccion) => {
	try {
		// Obtener la acción formativa para obtener su número
		const accionFormativa = await prisma.accionesFormativas.findUnique({
			where: { id_accion: parseInt(idAccion) },
			select: { numero_accion: true }
		});

		if (!accionFormativa || !accionFormativa.numero_accion) {
			return null;
		}

		// Obtener grupos existentes para esta acción formativa
		const gruposExistentes = await prisma.grupos.findMany({
			where: { id_accion: parseInt(idAccion) },
			select: { codigo: true }
		});

		// Extraer números de grupo existentes y encontrar el siguiente disponible
		const numerosExistentes = gruposExistentes
			.map(grupo => {
				if (grupo.codigo && grupo.codigo.startsWith(accionFormativa.numero_accion + '.')) {
					const parteNumerica = grupo.codigo.split('.')[1];
					return parseInt(parteNumerica);
				}
				return null;
			})
			.filter(num => num !== null && !isNaN(num))
			.sort((a, b) => a - b);

		// Encontrar el siguiente número disponible
		let siguienteNumero = 1;
		for (const num of numerosExistentes) {
			if (num === siguienteNumero) {
				siguienteNumero++;
			} else {
				break;
			}
		}

		return `${accionFormativa.numero_accion}.${siguienteNumero}`;
	} catch (error) {
		console.error('Error al obtener el siguiente código de grupo:', error);
		return null;
	}
};


const getAllGrupos = async (req, res) => {
	try {
		const { id_accion, id_plan, expediente_plan } = req.query;
		let whereClause = {};

		if (id_accion) {
			whereClause.id_accion = parseInt(id_accion);
		}

		if (id_plan) {
			whereClause.accionFormativa = {
				id_plan: parseInt(id_plan)
			};
		}

		if (expediente_plan) {
			whereClause.accionFormativa = {
				plan: {
					expediente: expediente_plan
				}
			};
		}


		// Si no hay filtros, obtener todos los grupos
		if (Object.keys(whereClause).length === 0) {
			whereClause = {};
		}

		const grupos = await prisma.grupos.findMany({
			where: whereClause,
			include: {
				accionFormativa: {
					include: {
						plan: true
					}
				}
			},
			orderBy: {
				id_grupo: 'desc'
			}
		});

		res.json(grupos);
	} catch (error) {
		console.error('Error al obtener grupos:', error);
		res.status(500).json({ error: 'Error interno del servidor' });
	}
};


const getGrupoById = async (req, res) => {
	try {
		const { id } = req.params;
		const grupo = await prisma.grupos.findUnique({
			where: { id_grupo: parseInt(id) },
			include: {
				accionFormativa: {
					include: {
						plan: true,
						areaProfesional: true,
						desgloseAreasProfesionales: true
					}
				},
				alumnosPersonaGrupo: {
					include: {
						persona: true,
						centro: {
							include: {
								empresa: true
							}
						}
					}
				},
				docentesPersonaGrupo: {
					include: {
						persona: true
					}
				}
			}
		});

		if (!grupo) {
			return res.status(404).json({ error: 'Grupo no encontrado' });
		}

		res.json(grupo);
	} catch (error) {
		console.error('Error al obtener grupo:', error);
		res.status(500).json({ error: 'Error interno del servidor' });
	}
};


const createGrupo = async (req, res) => {
	try {
		// Validar datos
		const validation = grupoModel.validate(req.body);
		if (!validation.isValid) {
			return res.status(400).json({
				error: 'Datos inválidos',
				details: validation.errors
			});
		}

		const filteredData = filterUpdateData(req.body);

		// Generar código automáticamente si se proporciona id_accion
		if (filteredData.id_accion) {
			const codigoAutogenerado = await getNextGroupCode(filteredData.id_accion);
			if (codigoAutogenerado) {
				filteredData.codigo = codigoAutogenerado;
			}
		}

		// Procesar fechas
		if (filteredData.fecha_inicio) {
			filteredData.fecha_inicio = new Date(filteredData.fecha_inicio);
		}
		if (filteredData.fecha_fin) {
			filteredData.fecha_fin = new Date(filteredData.fecha_fin);
		}

		// Procesar horas
		if (filteredData.horas_totales_presencial_horario) {
			filteredData.horas_totales_presencial_horario = parseInt(filteredData.horas_totales_presencial_horario);
		}
		if (filteredData.horas_totales_teleformacion) {
			filteredData.horas_totales_teleformacion = parseInt(filteredData.horas_totales_teleformacion);
		}

		// Procesar horas de tiempo
		if (filteredData.hora_inicio_tramo1_presencial_horario) {
			filteredData.hora_inicio_tramo1_presencial_horario = new Date(`1970-01-01T${filteredData.hora_inicio_tramo1_presencial_horario}`);
		}
		if (filteredData.hora_fin_tramo1_presencial_horario) {
			filteredData.hora_fin_tramo1_presencial_horario = new Date(`1970-01-01T${filteredData.hora_fin_tramo1_presencial_horario}`);
		}
		if (filteredData.hora_inicio_tramo2_presencial_horario) {
			filteredData.hora_inicio_tramo2_presencial_horario = new Date(`1970-01-01T${filteredData.hora_inicio_tramo2_presencial_horario}`);
		}
		if (filteredData.hora_fin_tramo2_presencial_horario) {
			filteredData.hora_fin_tramo2_presencial_horario = new Date(`1970-01-01T${filteredData.hora_fin_tramo2_presencial_horario}`);
		}
		if (filteredData.hora_inicio_tramo1_tele) {
			filteredData.hora_inicio_tramo1_tele = new Date(`1970-01-01T${filteredData.hora_inicio_tramo1_tele}`);
		}
		if (filteredData.hora_fin_tramo1_tele) {
			filteredData.hora_fin_tramo1_tele = new Date(`1970-01-01T${filteredData.hora_fin_tramo1_tele}`);
		}
		if (filteredData.hora_inicio_tramo2_tele) {
			filteredData.hora_inicio_tramo2_tele = new Date(`1970-01-01T${filteredData.hora_inicio_tramo2_tele}`);
		}
		if (filteredData.hora_fin_tramo2_tele) {
			filteredData.hora_fin_tramo2_tele = new Date(`1970-01-01T${filteredData.hora_fin_tramo2_tele}`);
		}

		// Procesar booleanos
		if (filteredData.aula_virtual !== undefined) {
			filteredData.aula_virtual = Boolean(filteredData.aula_virtual);
		}
		if (filteredData.bimodal_aula_virtual !== undefined) {
			filteredData.bimodal_aula_virtual = Boolean(filteredData.bimodal_aula_virtual);
		}
		if (filteredData.sin_participantes_en_centro_aula_virtual !== undefined) {
			filteredData.sin_participantes_en_centro_aula_virtual = Boolean(filteredData.sin_participantes_en_centro_aula_virtual);
		}
		if (filteredData.sin_docentes_en_centro_aula_virtual !== undefined) {
			filteredData.sin_docentes_en_centro_aula_virtual = Boolean(filteredData.sin_docentes_en_centro_aula_virtual);
		}

		// Procesar id_accion
		if (filteredData.id_accion) {
			filteredData.id_accion = parseInt(filteredData.id_accion);
		}

		// Procesar tipo_bonificación y max_alumnos
		if (req.body.tipo_bonificacion) {
    	filteredData.tipo_bonificacion = req.body.tipo_bonificacion;
		}
		if (req.body.max_alumnos) {
    	filteredData.max_alumnos = parseInt(req.body.max_alumnos);
		}

		const grupo = await prisma.grupos.create({
			data: filteredData
		});

		res.status(201).json(grupo);
	} catch (error) {
		console.error('Error al crear grupo:', error);
		res.status(500).json({ error: 'Error interno del servidor' });
	}
};


const updateGrupo = async (req, res) => {
	try {
		const { id } = req.params;

		// Validar datos
		const validation = grupoModel.validate(req.body);
		if (!validation.isValid) {
			return res.status(400).json({
				error: 'Datos inválidos',
				details: validation.errors
			});
		}

		const filteredData = filterUpdateData(req.body);

		// Procesar fechas
		if (filteredData.fecha_inicio) {
			filteredData.fecha_inicio = new Date(filteredData.fecha_inicio);
		}
		if (filteredData.fecha_fin) {
			filteredData.fecha_fin = new Date(filteredData.fecha_fin);
		}

		// Procesar horas
		if (filteredData.horas_totales_presencial_horario) {
			filteredData.horas_totales_presencial_horario = parseInt(filteredData.horas_totales_presencial_horario);
		}
		if (filteredData.horas_totales_teleformacion) {
			filteredData.horas_totales_teleformacion = parseInt(filteredData.horas_totales_teleformacion);
		}

		// Procesar horas de tiempo
		if (filteredData.hora_inicio_tramo1_presencial_horario) {
			filteredData.hora_inicio_tramo1_presencial_horario = new Date(`1970-01-01T${filteredData.hora_inicio_tramo1_presencial_horario}`);
		}
		if (filteredData.hora_fin_tramo1_presencial_horario) {
			filteredData.hora_fin_tramo1_presencial_horario = new Date(`1970-01-01T${filteredData.hora_fin_tramo1_presencial_horario}`);
		}
		if (filteredData.hora_inicio_tramo2_presencial_horario) {
			filteredData.hora_inicio_tramo2_presencial_horario = new Date(`1970-01-01T${filteredData.hora_inicio_tramo2_presencial_horario}`);
		}
		if (filteredData.hora_fin_tramo2_presencial_horario) {
			filteredData.hora_fin_tramo2_presencial_horario = new Date(`1970-01-01T${filteredData.hora_fin_tramo2_presencial_horario}`);
		}
		if (filteredData.hora_inicio_tramo1_tele) {
			filteredData.hora_inicio_tramo1_tele = new Date(`1970-01-01T${filteredData.hora_inicio_tramo1_tele}`);
		}
		if (filteredData.hora_fin_tramo1_tele) {
			filteredData.hora_fin_tramo1_tele = new Date(`1970-01-01T${filteredData.hora_fin_tramo1_tele}`);
		}
		if (filteredData.hora_inicio_tramo2_tele) {
			filteredData.hora_inicio_tramo2_tele = new Date(`1970-01-01T${filteredData.hora_inicio_tramo2_tele}`);
		}
		if (filteredData.hora_fin_tramo2_tele) {
			filteredData.hora_fin_tramo2_tele = new Date(`1970-01-01T${filteredData.hora_fin_tramo2_tele}`);
		}

		// Procesar id_accion
		if (filteredData.id_accion) {
			filteredData.id_accion = parseInt(filteredData.id_accion);
		}

		const grupo = await prisma.grupos.update({
			where: { id_grupo: parseInt(id) },
			data: filteredData
		});

		res.json(grupo);
	} catch (error) {
		console.error('Error al actualizar grupo:', error);
		if (error.code === 'P2025') {
			return res.status(404).json({ error: 'Grupo no encontrado' });
		}
		res.status(500).json({ error: 'Error interno del servidor' });
	}
};


const deleteGrupo = async (req, res) => {
	try {
		const { id } = req.params;

		// Obtener información del grupo antes de eliminarlo para logging
		const grupo = await prisma.grupos.findUnique({
			where: { id_grupo: parseInt(id) },
			select: { codigo: true, id_accion: true }
		});

		if (!grupo) {
			return res.status(404).json({ error: 'Grupo no encontrado' });
		}

		// Usar transacción para eliminar en cascada de forma segura
		await prisma.$transaction(async (tx) => {
			// Eliminar todas las relaciones del grupo en cascada
			// IMPORTANTE: Orden correcto para respetar las claves foráneas

			// 1. Eliminar alumnos del grupo
			await tx.alumnosPersonaGrupo.deleteMany({
				where: { id_grupo: parseInt(id) }
			});

			// 2. Eliminar costes del grupo
			await tx.costesGrupo.deleteMany({
				where: { id_grupo: parseInt(id) }
			});

			// 3. Eliminar tareas del grupo
			await tx.tareas.deleteMany({
				where: { id_grupo: parseInt(id) }
			});

			// 4. Eliminar documentación adjunta del grupo
			await tx.documentacionAdjGrupo.deleteMany({
				where: { id_grupo: parseInt(id) }
			});

			// 5. Eliminar logs de email del grupo
			await tx.emailLogs.deleteMany({
				where: { id_grupo: parseInt(id) }
			});

			// 6. Eliminar sesiones relacionadas con los días de impartición del grupo
			// Primero obtener los IDs de los días de impartición que se van a eliminar
			const diasTele = await tx.diasImparticionGrupoTeleformacion.findMany({
				where: { id_grupo: parseInt(id) },
				select: { id_dia_tele: true }
			});
			const diasPres = await tx.diasImparticionGrupoPresencial.findMany({
				where: { id_grupo: parseInt(id) },
				select: { id_dia_pres: true }
			});

			// Eliminar sesiones relacionadas con estos días
			if (diasTele.length > 0) {
				await tx.sesiones.deleteMany({
					where: {
						id_dia_tele: {
							in: diasTele.map(d => d.id_dia_tele)
						}
					}
				});
			}
			if (diasPres.length > 0) {
				await tx.sesiones.deleteMany({
					where: {
						id_dia_pres: {
							in: diasPres.map(d => d.id_dia_pres)
						}
					}
				});
			}

			// 7. Eliminar días de impartición de teleformación
			await tx.diasImparticionGrupoTeleformacion.deleteMany({
				where: { id_grupo: parseInt(id) }
			});

			// 8. Eliminar días de impartición presencial
			await tx.diasImparticionGrupoPresencial.deleteMany({
				where: { id_grupo: parseInt(id) }
			});

			// 9. Eliminar docentes del grupo (después de eliminar días de impartición)
			await tx.docentesPersonaGrupo.deleteMany({
				where: { id_grupo: parseInt(id) }
			});

			// 10. Finalmente, eliminar el grupo
			await tx.grupos.delete({
				where: { id_grupo: parseInt(id) }
			});
		});

		res.status(204).send();
	} catch (error) {
		console.error('Error al eliminar grupo:', error);
		if (error.code === 'P2025') {
			return res.status(404).json({ error: 'Grupo no encontrado' });
		}
		res.status(500).json({ error: 'Error interno del servidor' });
	}
};

// Endpoint para obtener el siguiente código disponible para una acción formativa
const getNextGroupCodeEndpoint = async (req, res) => {
	try {
		const { id_accion } = req.params;

		if (!id_accion) {
			return res.status(400).json({ error: 'ID de acción formativa requerido' });
		}

		const codigo = await getNextGroupCode(id_accion);

		if (!codigo) {
			return res.status(404).json({ error: 'No se pudo generar código para la acción formativa especificada' });
		}

		res.json({ codigo });
	} catch (error) {
		console.error('Error al obtener siguiente código de grupo:', error);
		res.status(500).json({ error: 'Error interno del servidor' });
	}
};

// Función para generar XML Fundae - Inicio grupo
const generateFundaeInicioGrupoXML = async (req, res) => {
	try {
		const { id } = req.params;

		if (!id) {
			return res.status(400).json({ error: 'ID de grupo requerido' });
		}

		// Obtener datos completos del grupo con todas las relaciones
		const grupo = await prisma.grupos.findUnique({
			where: { id_grupo: parseInt(id) },
			include: {
				accionFormativa: {
					include: {
						plan: true
					}
				},
				docentesPersonaGrupo: {
					include: {
						persona: true
					}
				},
				alumnosPersonaGrupo: {
					include: {
						persona: true,
						centro: {
							include: {
								empresa: true
							}
						}
					}
				},
				costesGrupo: true
			}
		});

		if (!grupo) {
			return res.status(404).json({ error: 'Grupo no encontrado' });
		}

		// Obtener días de impartición presenciales del grupo con sus sesiones
		const diasPresenciales = await prisma.diasImparticionGrupoPresencial.findMany({
			where: { id_grupo: parseInt(id) },
			include: {
				sesiones: {
					orderBy: { horario_inicio: 'asc' }
				}
			},
			orderBy: { fecha_imparticion: 'asc' }
		});

		// Generar el XML
		const xml = await generateXMLStructure(grupo, { diasPresenciales: diasPresenciales });

		// Configurar headers para descarga
		res.setHeader('Content-Type', 'application/xml');
		res.setHeader('Content-Disposition', `attachment; filename="fundae_inicio_grupo_${grupo.codigo || id}.xml"`);
		res.send(xml);

	} catch (error) {
		console.error('Error al generar XML Fundae:', error);
		// Si el error tiene un mensaje específico (validaciones), devolverlo
		if (error.message && error.message.includes('No se puede generar XML')) {
			return res.status(400).json({ 
				error: error.message,
				details: error.message
			});
		}
		res.status(500).json({ error: 'Error interno del servidor', details: error.message });
	}
};

// Función optimizada para obtener horas de todos los docentes del grupo
const obtenerDocentesConHoras = async (idGrupo) => {
	try {
		const docentes = await prisma.docentesPersonaGrupo.findMany({
			where: { id_grupo: parseInt(idGrupo) },
			include: {
				persona: true,
				sesiones: {
					include: {
						diaTeleformacion: true,
						diaPresencial: true
					}
				}
			}
		});

		// Calcular horas para cada docente
		return docentes.map(docente => {
			let horasTotales = 0;
			let horasPresenciales = 0;
			let horasTeleformacion = 0;

			docente.sesiones.forEach(sesion => {
				if (sesion.horario_inicio && sesion.horario_fin) {
					const inicio = new Date(sesion.horario_inicio);
					const fin = new Date(sesion.horario_fin);
					const horasSesion = (fin - inicio) / (1000 * 60 * 60);

					horasTotales += horasSesion;

					// Clasificar por modalidad de la sesión
					if (sesion.diaPresencial) {
						horasPresenciales += horasSesion;
					} else if (sesion.diaTeleformacion) {
						horasTeleformacion += horasSesion;
					}
				}
			});

			return {
				...docente,
				horas_totales: Math.round(horasTotales * 100) / 100,
				horas_presenciales: Math.round(horasPresenciales * 100) / 100,
				horas_teleformacion: Math.round(horasTeleformacion * 100) / 100
			};
		});
	} catch (error) {
		console.error('Error al obtener docentes con horas:', error);
		return [];
	}
};

// Función auxiliar para generar la estructura XML
const generateXMLStructure = async (grupo, extras = {}) => {
	// Obtener docentes con horas calculadas
	const docentesConHoras = await obtenerDocentesConHoras(grupo.id_grupo);
	const formatDate = (date) => {
		if (!date) return '';
		const d = new Date(date);
		return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
	};

	const formatTime = (time) => {
		if (!time) return '';
		// Si ya es un objeto Date, usarlo directamente
		if (time instanceof Date) {
			if (isNaN(time.getTime())) return '';
			return time.toTimeString().slice(0, 5);
		}
		// Si es un string, intentar parsearlo
		if (typeof time === 'string') {
			const t = new Date(`1970-01-01T${time}`);
			if (isNaN(t.getTime())) return '';
			return t.toTimeString().slice(0, 5);
		}
		return '';
	};

	const mapTipoDocumento = (tipo) => {
		const mapping = {
			'DNI': '10',
			'NIF': '10',
			'NIE': '60',
			'Pasaporte': '20'
		};
		if (!tipo || !mapping[tipo]) {
			throw new Error(`Tipo de documento no válido: ${tipo}`);
		}
		return mapping[tipo];
	};

	const mapTipoTutoria = (tipo) => {
		const mapping = {
			'Correo electrónico (1)': '1',
			'Videoconferencia (2)': '2',
			'Foro (3)': '3',
			'Otras (4)': '4'
		};
		return mapping[tipo] || '1';
	};

	// Función auxiliar para generar elementos de horario solo si tienen valor
	const generateHoraElement = (name, timeValue) => {
		const time = formatTime(timeValue);
		return time ? `        <${name}>${time}</${name}>` : '';
	};

	// Función para calcular horarios de tramos a partir de las sesiones
	const calcularHorariosTramos = (sesiones) => {
		if (!sesiones || sesiones.length === 0) {
			return {
				horario_inicio_tramo1: null,
				horario_fin_tramo1: null,
				horario_inicio_tramo2: null,
				horario_fin_tramo2: null
			};
		}

		// Separar sesiones en mañana (hasta 14:00) y tarde (después de 14:00)
		const sesionesManana = [];
		const sesionesTarde = [];

		sesiones.forEach(sesion => {
			if (!sesion.horario_inicio || !sesion.horario_fin) return;

			const horaInicio = new Date(sesion.horario_inicio);
			const horaInicioHoras = horaInicio.getHours();
			const horaInicioMinutos = horaInicio.getMinutes();
			const horaInicioTotal = horaInicioHoras * 60 + horaInicioMinutos;

			// Considerar mañana si es_manana es true O si la hora de inicio es antes de las 14:00
			const esManana = sesion.es_manana === true || horaInicioTotal < 14 * 60;

			if (esManana) {
				sesionesManana.push(sesion);
			} else {
				sesionesTarde.push(sesion);
			}
		});


		

		// Calcular horarios del tramo 1 (mañana)
		let horarioInicioTramo1 = null;
		let horarioFinTramo1 = null;

		if (sesionesManana.length > 0) {
			// Encontrar el mínimo horario_inicio y máximo horario_fin de las sesiones de mañana
			let minInicio = null;
			let maxFin = null;

			sesionesManana.forEach(sesion => {
				const inicio = new Date(sesion.horario_inicio);
				const fin = new Date(sesion.horario_fin);

				if (minInicio === null || inicio < minInicio) {
					minInicio = inicio;
				}
				if (maxFin === null || fin > maxFin) {
					maxFin = fin;
				}
			});

			horarioInicioTramo1 = minInicio;
			horarioFinTramo1 = maxFin;
		}

		// Calcular horarios del tramo 2 (tarde)
		let horarioInicioTramo2 = null;
		let horarioFinTramo2 = null;

		if (sesionesTarde.length > 0) {
			// Encontrar el mínimo horario_inicio y máximo horario_fin de las sesiones de tarde
			let minInicio = null;
			let maxFin = null;

			sesionesTarde.forEach(sesion => {
				const inicio = new Date(sesion.horario_inicio);
				const fin = new Date(sesion.horario_fin);

				if (minInicio === null || inicio < minInicio) {
					minInicio = inicio;
				}
				if (maxFin === null || fin > maxFin) {
					maxFin = fin;
				}
			});

			horarioInicioTramo2 = minInicio;
			horarioFinTramo2 = maxFin;
		}

		return {
			horario_inicio_tramo1: horarioInicioTramo1,
			horario_fin_tramo1: horarioFinTramo1,
			horario_inicio_tramo2: horarioInicioTramo2,
			horario_fin_tramo2: horarioFinTramo2
		};
	};

	// Función auxiliar para ordenar los días según el orden requerido por el XSD: L, M, X, J, V, S, D
	const ordenarDias = (dias) => {
		if (!dias || typeof dias !== 'string') return '';
		
		// Orden correcto según el XSD
		const ordenDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
		const diasArray = dias.toUpperCase().split('').filter(d => ordenDias.includes(d));
		
		// Ordenar según el orden requerido
		const diasOrdenados = diasArray.sort((a, b) => {
			return ordenDias.indexOf(a) - ordenDias.indexOf(b);
		});
		
		return diasOrdenados.join('');
	};

	// Generar tutoría específica basada en el tipo asignado
	const generarTutorias = (docente) => {
		let tutorias = '';

		// Solo generar la tutoría específica que tiene asignada
		tutorias += `
        <tutoria>
          <tipoTutoria>
            <tutorias>${mapTipoTutoria(docente.tipotutoria)}</tutorias>
          </tipoTutoria>
          <descripcion>${truncateString(docente.descripcion || '', 50)}</descripcion>
        </tutoria>`;

		return tutorias;
	};

	// Obtener nombre del responsable usando Azure ID
	const responsableNombre = await getUsuarioNombre(grupo.responsable);

	// Filtrar alumnos que no tengan estado 'No Participa'
	const alumnosParticipantes = grupo.alumnosPersonaGrupo?.filter(
		alumno => alumno.estado_curso !== ESTADO_CURSO.NO_PARTICIPA
	) || [];

	let xml = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<grupos>
  <grupo>
    <idAccion>${grupo.accionFormativa?.numero_accion || ''}</idAccion>
    <idGrupo>${grupo.codigo ? grupo.codigo.split('.').pop() : ''}</idGrupo>
    <descripcion>${truncateString(grupo.denominacion || '', 100)}</descripcion>
    <NumeroParticipante>${alumnosParticipantes.length}</NumeroParticipante>
    <fechaInicio>${formatDate(grupo.fecha_inicio)}</fechaInicio>
    <fechaFin>${formatDate(grupo.fecha_fin)}</fechaFin>
    <responsable>${truncateString(responsableNombre, 100)}</responsable>
    <telefonoContacto>${grupo.telefono_responsable || ''}</telefonoContacto>`;

	// Modalidad presencial
	if (grupo.centro_cif || grupo.centro_nombre) {
		xml += `
    <jornadaPresencial>
      <centro>
        <cif>${grupo.centro_cif || ''}</cif>
        <nombreCentro>${truncateString(grupo.centro_nombre || '', 100)}</nombreCentro>
        <direccionDetallada>${truncateString(grupo.centro_direccion || '', 100)}</direccionDetallada>
        <codPostal>${grupo.centro_codPostal || ''}</codPostal>
        <localidad>${truncateString(grupo.centro_localidad || '', 75)}</localidad>
      </centro>
      <lugarImparticion>
        <cif>${grupo.lugar_imparticion_cif || ''}</cif>
        <nombreCentro>${truncateString(grupo.lugar_imparticion_nombre || '', 100)}</nombreCentro>
        <direccionDetallada>${truncateString(grupo.lugar_imparticion_direccion || '', 100)}</direccionDetallada>
        <codPostal>${grupo.lugar_imparticion_codPostal || ''}</codPostal>
        <localidad>${truncateString(grupo.lugar_imparticion_localidad || '', 75)}</localidad>
      </lugarImparticion>
      <horario>
        <horaTotales>${grupo.accionFormativa?.horas_modalidad_presencial || 0}</horaTotales>${generateHoraElement('horaInicioTramo1', grupo.hora_inicio_tramo1_presencial_horario)}${generateHoraElement('horaFinTramo1', grupo.hora_fin_tramo1_presencial_horario)}${generateHoraElement('horaInicioTramo2', grupo.hora_inicio_tramo2_presencial_horario)}${generateHoraElement('horaFinTramo2', grupo.hora_fin_tramo2_presencial_horario)}
        <dias>${ordenarDias(grupo.dias_presencial_horario)}</dias>
      </horario>`;

		// Validar que haya días de impartición presenciales (OBLIGATORIO según XSD)
		if (!extras.diasPresenciales || !Array.isArray(extras.diasPresenciales) || extras.diasPresenciales.length === 0) {
			throw new Error('No se puede generar XML: se requiere al menos un día de impartición presencial. El grupo debe tener días de impartición con fechas asignadas.');
		}
		
		// Añadir días de impartición presenciales como elementos calendario (OBLIGATORIO según XSD)
		extras.diasPresenciales.forEach(dia => {
			// Calcular horarios a partir de las sesiones del día
			const horariosCalculados = calcularHorariosTramos(dia.sesiones || []);
			
			const horaInicio1 = formatTime(horariosCalculados.horario_inicio_tramo1);
			const horaFin1 = formatTime(horariosCalculados.horario_fin_tramo1);
			const horaInicio2 = formatTime(horariosCalculados.horario_inicio_tramo2);
			const horaFin2 = formatTime(horariosCalculados.horario_fin_tramo2);
			
			xml += `
      <calendario>
        <fecha_imparticion>${formatDate(dia.fecha_imparticion)}</fecha_imparticion>${horaInicio1 ? `\n        <horario_inicio_tramo1>${horaInicio1}</horario_inicio_tramo1>` : ''}${horaFin1 ? `\n        <horario_fin_tramo1>${horaFin1}</horario_fin_tramo1>` : ''}${horaInicio2 ? `\n        <horario_inicio_tramo2>${horaInicio2}</horario_inicio_tramo2>` : ''}${horaFin2 ? `\n        <horario_fin_tramo2>${horaFin2}</horario_fin_tramo2>` : ''}
      </calendario>`;
		});

		// Tutores presenciales
		const tutoresPresenciales = (docentesConHoras || []).filter(docente => docente.modalidad === MODALIDAD_DOCENTE.PRESENCIAL);
		
		// Validar que todos los tutores presenciales tengan horas asignadas
		for (const docente of tutoresPresenciales) {
			if (!docente.horas_presenciales || docente.horas_presenciales === 0) {
				const nombreDocente = docente.persona?.nombre && docente.persona?.apellido1 
					? `${docente.persona.nombre} ${docente.persona.apellido1}` 
					: 'un tutor';
				throw new Error(`No se puede generar XML: el tutor presencial ${nombreDocente} no tiene horas asignadas. Es necesario que el tutor tenga sesiones con horarios válidos.`);
			}
		}
		
		for (const docente of tutoresPresenciales) {
			xml += `
      <Tutor>
        <numeroHoras>${docente.horas_presenciales}</numeroHoras>
        <tipoDocumento>${mapTipoDocumento(docente.persona?.tipoDocumento)}</tipoDocumento>
        <documento>${docente.persona?.documento || ''}</documento>
        <nombre>${docente.persona?.nombre || ''}</nombre>
        <apellido1>${docente.persona?.apellido1 || ''}</apellido1>
        <apellido2>${docente.persona?.apellido2 || ''}</apellido2>
        <telefono>${docente.persona?.telefono || ''}</telefono>
        <correoElectronico>${docente.persona?.correoElectronico || ''}</correoElectronico>
      </Tutor>`;
		}

		xml += `
    </jornadaPresencial>`;
	}

	// Modalidad teleformación
	if (grupo.tele_centro_cif || grupo.tele_centro_nombre) {
		xml += `
    <distanciaTeleformacion>
      <asistenciaTeleformacion>
        <centro>
          <cif>${grupo.tele_centro_cif || ''}</cif>
          <nombreCentro>${truncateString(grupo.tele_centro_nombre || '', 100)}</nombreCentro>
          <direccionDetallada>${truncateString(grupo.tele_centro_direccion || '', 100)}</direccionDetallada>
          <codPostal>${grupo.tele_centro_codPostal || ''}</codPostal>
          <localidad>${truncateString(grupo.tele_centro_localidad || '', 75)}</localidad>
        </centro>
        <telefono>${grupo.tele_telefono || ''}</telefono>
      </asistenciaTeleformacion>
      <horario>
        <horaTotales>${grupo.accionFormativa?.horas_modalidad_teleformacion || 0}</horaTotales>${generateHoraElement('horaInicioTramo1', grupo.hora_inicio_tramo1_tele)}${generateHoraElement('horaFinTramo1', grupo.hora_fin_tramo1_tele)}${generateHoraElement('horaInicioTramo2', grupo.hora_inicio_tramo2_tele)}${generateHoraElement('horaFinTramo2', grupo.hora_fin_tramo2_tele)}
        <dias>${ordenarDias(grupo.dias_tele)}</dias>
      </horario>`;

		// Tutores teleformación
		const tutoresTeleformacion = (docentesConHoras || []).filter(docente => docente.modalidad === MODALIDAD_DOCENTE.TELEFORMACION);
		
		// Validar que todos los tutores de teleformación tengan horas asignadas
		for (const docente of tutoresTeleformacion) {
			if (!docente.horas_teleformacion || docente.horas_teleformacion === 0) {
				const nombreDocente = docente.persona?.nombre && docente.persona?.apellido1 
					? `${docente.persona.nombre} ${docente.persona.apellido1}` 
					: 'un tutor';
				throw new Error(`No se puede generar XML: el tutor de teleformación ${nombreDocente} no tiene horas asignadas. Es necesario que el tutor tenga sesiones con horarios válidos.`);
			}
		}
		
		for (const docente of tutoresTeleformacion) {
			xml += `
      <Tutor>
        <numeroHoras>${docente.horas_teleformacion}</numeroHoras>
        <tipoDocumento>${mapTipoDocumento(docente.persona?.tipoDocumento)}</tipoDocumento>
        <documento>${docente.persona?.documento || ''}</documento>
        <nombre>${docente.persona?.nombre || ''}</nombre>
        <apellido1>${docente.persona?.apellido1 || ''}</apellido1>
        <apellido2>${docente.persona?.apellido2 || ''}</apellido2>
        <telefono>${docente.persona?.telefono || ''}</telefono>
        <correoElectronico>${docente.persona?.correoElectronico || ''}</correoElectronico>${generarTutorias(docente)}
      </Tutor>`;
		}

		xml += `
    </distanciaTeleformacion>`;
	}

	// Aula virtual
	if (grupo.aula_virtual) {
		xml += `
    <aulaVirtual>
      <medio>${truncateString(grupo.medio_aula_virtual || '', 100)}</medio>
      <conexion>${truncateString(grupo.conexion_aula_virtual || '', 100)}</conexion>
      <contacto>${truncateString(grupo.contacto_aula_virtual || '', 100)}</contacto>
      <telefono>${grupo.telefono_aula_virtual || ''}</telefono>
      <bimodal>${grupo.bimodal_aula_virtual ? 'true' : 'false'}</bimodal>
      <sinParticipantesEnCentro>${grupo.sin_participantes_en_centro_aula_virtual ? 'true' : 'false'}</sinParticipantesEnCentro>
      <sinDocentesEnCentro>${grupo.sin_docentes_en_centro_aula_virtual ? 'true' : 'false'}</sinDocentesEnCentro>
    </aulaVirtual>`;
	}

	// Empresas participantes (OBLIGATORIO según XSD - debe tener al menos una empresa)
	xml += `
    <EmpresasParticipantes>`;

	// Obtener empresas únicas de los alumnos participantes (excluyendo 'No Participa')
	const empresasUnicas = new Set();
	alumnosParticipantes.forEach((alumno) => {
		if (alumno.centro?.empresa?.CIF && !empresasUnicas.has(alumno.centro.empresa.CIF)) {
			empresasUnicas.add(alumno.centro.empresa.CIF);

			xml += `
      <empresa>
        <cifEmpresaParticipante>${alumno.centro.empresa.CIF}</cifEmpresaParticipante>`;

			if (alumno.jornada_laboral) {
				xml += `
        <jornadaLaboral>1</jornadaLaboral>`;
			}

			xml += `
      </empresa>`;
		}
	});

	// Validar que haya al menos una empresa (OBLIGATORIO según XSD)
	if (empresasUnicas.size === 0) {
		throw new Error('No se puede generar XML: se requiere al menos una empresa participante. El grupo no tiene alumnos con empresas asociadas.');
	}

	xml += `
    </EmpresasParticipantes>
    <observaciones>${grupo.observaciones || ''}</observaciones>
  </grupo>
</grupos>`;

	return xml;
};

// Función para generar XML Fundae - Fin grupo
const generateFundaeFinGrupoXML = async (req, res) => {
	try {
		const { id } = req.params;

		if (!id) {
			return res.status(400).json({ error: 'ID de grupo requerido' });
		}

		// Obtener datos completos del grupo con todas las relaciones
		const grupo = await prisma.grupos.findUnique({
			where: { id_grupo: parseInt(id) },
			include: {
				accionFormativa: {
					include: {
						plan: true
					}
				},
				alumnosPersonaGrupo: {
					include: {
						persona: true
					}
				},
				costesGrupo: true
			}
		});

		if (!grupo) {
			return res.status(404).json({ error: 'Grupo no encontrado' });
		}

		// Generar el XML
		const xml = generateFinGrupoXMLStructure(grupo);

		// Configurar headers para descarga
		res.setHeader('Content-Type', 'application/xml');
		res.setHeader('Content-Disposition', `attachment; filename="fundae_fin_grupo_${grupo.codigo || id}.xml"`);
		res.send(xml);

	} catch (error) {
		console.error('Error al generar XML Fundae Fin grupo:', error);
		// Si el error tiene un mensaje específico (validaciones), devolverlo
		if (error.message && error.message.includes('No se puede generar XML')) {
			return res.status(400).json({ 
				error: error.message,
				details: error.message
			});
		}
		res.status(500).json({ error: 'Error interno del servidor', details: error.message });
	}
};

// Función auxiliar para generar la estructura XML de fin de grupo
const generateFinGrupoXMLStructure = (grupo) => {
	const mapTipoDocumento = (tipo) => {
		const mapping = {
			'DNI': '10',
			'NIF': '10',
			'NIE': '60',
			'Pasaporte': '20'
		};
		if (!tipo || !mapping[tipo]) {
			throw new Error(`Tipo de documento no válido: ${tipo}`);
		}
		return mapping[tipo];
	};

	const mapCategoriaProfesional = (categoria) => {
		// Mapeo de categorías profesionales según el XSD y enums del proyecto
		const mapping = {
			'Directivo': 1,
			'Mando Intermedio': 2,
			'Técnico': 3,
			'Tecnico': 3,
			'Administrativo': 4,
			'Auxiliar': 5,
			'Subalterno': 5,
			'Obrero': 5
		};
		if (!categoria || !mapping[categoria]) {
			throw new Error(`Categoría profesional no válida: ${categoria}`);
		}
		return mapping[categoria];
	};

	const mapDiploma = (diploma) => {
		if (!diploma) return 'N';
		// Mapeo según enums del proyecto
		const mapping = {
			'Diploma': 'S',
			'Certificado de Asistencia': 'S'
		};
		return mapping[diploma] || 'N';
	};

	const mapNivelEstudios = (nivel) => {
		// Mapeo de niveles de estudios según el XSD y enumeración del frontend
		const mapping = {
			0: 1, // Sin estudios → Menos que primaria
			1: 2, // Educación Primaria → Educación primaria
			2: 3, // Educación Secundaria Obligatoria → Primera etapa de educación secundaria
			3: 4, // Bachillerato → Segunda etapa de educación secundaria
			4: 5, // Formación Profesional Grado Medio → Educación postsecundaria no superior
			5: 6, // Formación Profesional Grado Superior → Técnico Superior/FP grado superior
			6: 7, // Grado Universitario → E. universitarios 1º ciclo
			7: 8, // Máster → E. universitarios 2º ciclo
			8: 9  // Doctorado → E. universitarios 3º ciclo
		};
		if (nivel === null || nivel === undefined || !mapping.hasOwnProperty(nivel)) {
			throw new Error(`Nivel de estudios no válido: ${nivel}`);
		}
		return mapping[nivel];
	};

	// Filtrar alumnos que no tengan estado 'No Participa'
	const alumnosParticipantes = grupo.alumnosPersonaGrupo?.filter(
		alumno => alumno.estado_curso !== ESTADO_CURSO.NO_PARTICIPA
	) || [];

	let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<grupos>
  <grupo>
    <idAccion>${grupo.accionFormativa?.numero_accion || ''}</idAccion>
    <idGrupo>${grupo.codigo ? grupo.codigo.split('.').pop() : ''}</idGrupo>
    <participantes>`;

	// Participantes (alumnos) - excluyendo los que tienen estado 'No Participa'
	alumnosParticipantes.forEach(alumno => {
		xml += `
      <participante>
        <nif>${alumno.persona?.documento || ''}</nif>
        <N_TIPO_DOCUMENTO>${mapTipoDocumento(alumno.persona?.tipoDocumento)}</N_TIPO_DOCUMENTO>
        <ERTE_RD_ley>${alumno.ERTE ? 'true' : 'false'}</ERTE_RD_ley>
        <email>${alumno.persona?.correoElectronico || ''}</email>
        <telefono>${alumno.persona?.telefono || ''}</telefono>
        <discapacidad>${alumno.persona?.discapacidad ? 'true' : 'false'}</discapacidad>
        <afectadosTerrorismo>${alumno.persona?.afectadosTerrorismo ? 'true' : 'false'}</afectadosTerrorismo>
        <afectadosViolenciaGenero>${alumno.persona?.afectadosViolenciaGenero ? 'true' : 'false'}</afectadosViolenciaGenero>
        <categoriaprofesional>${mapCategoriaProfesional(alumno.categoria_profesional)}</categoriaprofesional>
        <nivelestudios>${mapNivelEstudios(alumno.persona?.nivel_estudios)}</nivelestudios>
        <DiplomaAcreditativo>${mapDiploma(alumno.diploma)}</DiplomaAcreditativo>
        <fijoDiscontinuo>${alumno.fijo_discontinuo ? 'true' : 'false'}</fijoDiscontinuo>
      </participante>`;
	});

	xml += `
    </participantes>`;

	// Costes del grupo (OBLIGATORIO según XSD - debe tener al menos un coste)
	if (!grupo.costesGrupo || grupo.costesGrupo.length === 0) {
		throw new Error('No se puede generar XML: se requiere al menos un coste. El grupo no tiene costes asociados.');
	}

	xml += `
    <costes>`;

	// Costes del grupo
	grupo.costesGrupo.forEach(coste => {
		xml += `
      <coste>
        <cifagrupada>${coste.cif || ''}</cifagrupada>
        <directos>${coste.directos || 0}</directos>
        <indirectos>${coste.indirectos || 0}</indirectos>
        <organizacion>${coste.organizacion || 0}</organizacion>
        <salariales>${coste.salariales || 0}</salariales>`;

		// Periodos (meses con importes)
		const periodos = [
			{ mes: 1, importe: coste.periodos_enero },
			{ mes: 2, importe: coste.periodos_febrero },
			{ mes: 3, importe: coste.periodos_marzo },
			{ mes: 4, importe: coste.periodos_abril },
			{ mes: 5, importe: coste.periodos_mayo },
			{ mes: 6, importe: coste.periodos_junio },
			{ mes: 7, importe: coste.periodos_julio },
			{ mes: 8, importe: coste.periodos_agosto },
			{ mes: 9, importe: coste.periodos_septiembre },
			{ mes: 10, importe: coste.periodos_octubre },
			{ mes: 11, importe: coste.periodos_noviembre },
			{ mes: 12, importe: coste.periodos_diciembre }
		];

		const periodosConImporte = periodos.filter(p => p.importe && p.importe > 0);

		if (periodosConImporte.length > 0) {
			xml += `
        <periodos>`;

			periodosConImporte.forEach(periodo => {
				xml += `
          <periodo>
            <mes>${periodo.mes}</mes>
            <importe>${periodo.importe}</importe>
          </periodo>`;
			});

			xml += `
        </periodos>`;
		}

		xml += `
      </coste>`;
	});

	xml += `
    </costes>
  </grupo>
</grupos>`;

	return xml;
};

/**
 * Genera y descarga el PDF de RECIBÍ DE MATERIAL para un grupo
 * GET /api/grupos/:id/recibi-material
 */
const downloadRecibiMaterial = async (req, res) => {
	try {
		const { id } = req.params;

		if (!id) {
			return res.status(400).json({ error: 'ID de grupo requerido' });
		}

		// Obtener datos completos del grupo con alumnos
		const grupo = await prisma.grupos.findUnique({
			where: { id_grupo: parseInt(id) },
			include: {
				accionFormativa: {
					include: {
						plan: true
					}
				},
				alumnosPersonaGrupo: {
					include: {
						persona: true
					}
				}
			}
		});

		if (!grupo) {
			return res.status(404).json({ error: 'Grupo no encontrado' });
		}

		// Validar que hay alumnos en el grupo
		if (!grupo.alumnosPersonaGrupo || grupo.alumnosPersonaGrupo.length === 0) {
			return res.status(400).json({
				error: 'No se puede generar RECIBÍ DE MATERIAL',
				details: 'El grupo no tiene alumnos asignados'
			});
		}

		// Separar número y grupo del código (ej: "12.1" -> numero: "12", grupo: "1")
		const codigoCompleto = grupo.codigo || grupo.accionFormativa?.numero_accion || '';
		const partesCodigo = codigoCompleto.split('.');
		const numeroAccion = partesCodigo[0] || '';
		const numeroGrupo = partesCodigo[1] || '';

		// Preparar datos del grupo para el PDF
		const grupoData = {
			entidadOrganizadora: 'CENTRO DE FORMACIÓN PRAXIS',
			expediente: grupo.accionFormativa?.plan?.expediente || grupo.expediente || '',
			cif: grupo.cif || 'B152625296', // CIF por defecto, se puede configurar
			denominacion: grupo.denominacion || grupo.accionFormativa?.denominacion || '',
			numero: numeroAccion,
			grupo: numeroGrupo,
			fechaInicio: grupo.fecha_inicio,
			fechaFin: grupo.fecha_fin
		};


		// Preparar datos de los alumnos
		const alumnosData = grupo.alumnosPersonaGrupo.map(alumno => ({
			apellidos: `${alumno.persona.apellido1 || ''} ${alumno.persona.apellido2 || ''}`.trim(),
			nombre: alumno.persona.nombre || '',
			documento: alumno.persona.documento || ''
		}))
		.sort((a, b) => a.apellidos.localeCompare(b.apellidos, 'es', { sensitivity: 'base' }));

		// Validar datos
		const validation = pdfService.validateRecibiMaterialData(grupoData, alumnosData);
		if (!validation.isValid) {
			return res.status(400).json({
				error: 'Datos incompletos para generar RECIBÍ DE MATERIAL',
				details: validation.errors
			});
		}

		// Generar el PDF
		const pdfBuffer = await pdfService.generateRecibiMaterial(grupoData, alumnosData);

		// Configurar headers para descarga
		const fileName = `Recibi_Material_${grupo.denominacion?.replace(/[^a-zA-Z0-9]/g, '_') || `Grupo_${grupo.id_grupo}`}.pdf`;

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
		res.setHeader('Content-Length', pdfBuffer.length);

		// Enviar el PDF
		res.send(pdfBuffer);

	} catch (error) {
		console.error('Error al generar RECIBÍ DE MATERIAL:', error);
		res.status(500).json({
			error: 'Error interno del servidor al generar RECIBÍ DE MATERIAL',
			details: error.message
		});
	}
};

/**
 * Genera y descarga el PDF de CONTROL DE ASISTENCIA para un grupo
 * GET /api/grupos/:id/control-asistencia
 * Query params opcionales:
 *   - sesionId: ID de la sesión para rellenar los datos específicos
 */
const downloadControlAsistencia = async (req, res) => {
	try {
		const { id } = req.params;
		const { sesionId } = req.query;

		if (!id) {
			return res.status(400).json({ error: 'ID de grupo requerido' });
		}

		// Obtener datos completos del grupo con alumnos, días de impartición y docentes
		const grupo = await prisma.grupos.findUnique({
			where: { id_grupo: parseInt(id) },
			include: {
				accionFormativa: {
					include: {
						plan: true
					}
				},
				alumnosPersonaGrupo: {
					include: {
						persona: true
					}
				},
				diasImparticionTeleformacion: {
					orderBy: {
						fecha_imparticion: 'asc'
					}
				},
				diasImparticionPresencial: {
					orderBy: {
						fecha_imparticion: 'asc'
					}
				}
			}
		});

		if (!grupo) {
			return res.status(404).json({ error: 'Grupo no encontrado' });
		}

		// Validar que hay alumnos en el grupo
		if (!grupo.alumnosPersonaGrupo || grupo.alumnosPersonaGrupo.length === 0) {
			return res.status(400).json({
				error: 'No se puede generar CONTROL DE ASISTENCIA',
				details: 'El grupo no tiene alumnos asignados'
			});
		}

		// Separar número y grupo del código (ej: "12.1" -> numero: "12", grupo: "1")
		const codigoCompleto = grupo.codigo || grupo.accionFormativa?.numero_accion || '';
		const partesCodigo = codigoCompleto.split('.');
		const numeroAccion = partesCodigo[0] || '';
		const numeroGrupo = partesCodigo[1] || '';

		// Preparar datos del grupo para el PDF
		const grupoData = {
			entidadOrganizadora: 'CENTRO DE FORMACIÓN PRAXIS',
			expediente: grupo.accionFormativa?.plan?.expediente || grupo.expediente || '',
			cif: grupo.cif || 'B152625296',
			denominacion: grupo.denominacion || grupo.accionFormativa?.denominacion || '',
			numero: numeroAccion,
			grupo: numeroGrupo,
			fechaInicio: grupo.fecha_inicio,
			fechaFin: grupo.fecha_fin
		};

		// Preparar datos de los alumnos
		const alumnosData = grupo.alumnosPersonaGrupo.map(alumno => ({
			apellidos: `${alumno.persona.apellido1 || ''} ${alumno.persona.apellido2 || ''}`.trim(),
			nombre: alumno.persona.nombre || '',
			documento: alumno.persona.documento || ''
		}))
		.sort((a, b) => a.apellidos.localeCompare(b.apellidos, 'es', { sensitivity: 'base' }));

		let sesionData = null;
		let numeroSesionCalculado = '';

		if (sesionId) {
			const sesion = await prisma.sesiones.findUnique({
				where: { id_sesion: parseInt(sesionId) },
				include: {
					docente: {
						include: {
							persona: true
						}
					},
					diaTeleformacion: true,
					diaPresencial: true
				}
			});

			if (sesion) {
				// Obtener la fecha de impartición según el tipo de sesión
				const diaImparticion = sesion.diaTeleformacion || sesion.diaPresencial;
				const fechaImparticion = diaImparticion?.fecha_imparticion;

				// Calcular el número de sesión (posición en la lista ordenada por fecha)
				const todasLasSesiones = await prisma.sesiones.findMany({
					where: {
						OR: [
							{ diaTeleformacion: { id_grupo: parseInt(id) } },
							{ diaPresencial: { id_grupo: parseInt(id) } }
						]
					},
					include: {
						diaTeleformacion: true,
						diaPresencial: true
					},
					orderBy: { id_sesion: 'asc' }
				});

				// Ordenar por fecha de impartición
				todasLasSesiones.sort((a, b) => {
					const fechaA = a.diaTeleformacion?.fecha_imparticion || a.diaPresencial?.fecha_imparticion;
					const fechaB = b.diaTeleformacion?.fecha_imparticion || b.diaPresencial?.fecha_imparticion;
					return new Date(fechaA) - new Date(fechaB);
				});

				// Encontrar la posición de la sesión actual
				const posicion = todasLasSesiones.findIndex(s => s.id_sesion === parseInt(sesionId));
				numeroSesionCalculado = posicion >= 0 ? String(posicion + 1) : '';

				// Formatear horarios (usar UTC para evitar problemas de zona horaria)
				const formatTime = (date) => {
					if (!date) return '';
					const d = new Date(date);
					const hours = d.getUTCHours().toString().padStart(2, '0');
					const minutes = d.getUTCMinutes().toString().padStart(2, '0');
					return `${hours}:${minutes}`;
				};

				// Formatear fecha
				const formatDate = (date) => {
					if (!date) return '';
					const d = new Date(date);
					return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
				};

				// Obtener nombre del docente
				const docenteNombre = sesion.docente?.persona
					? `${sesion.docente.persona.nombre || ''} ${sesion.docente.persona.apellido1 || ''} ${sesion.docente.persona.apellido2 || ''}`.trim()
					: '';

				sesionData = {
					numeroSesion: numeroSesionCalculado,
					fecha: formatDate(fechaImparticion),
					docente: docenteNombre,
					esManana: sesion.es_manana,
					horarioInicio: formatTime(sesion.horario_inicio),
					horarioFin: formatTime(sesion.horario_fin)
				};
			}
		}

		// Generar el PDF
		const pdfBuffer = await pdfService.generateControlAsistencia(grupoData, alumnosData, sesionData);

		// Configurar headers para descarga
		let fileName;
		if (sesionData) {
			fileName = `Control_Asistencia_Sesion_${numeroSesionCalculado}_${sesionData.fecha.replace(/\//g, '-')}.pdf`;
		} else {
			fileName = `Control_Asistencia_${grupo.denominacion?.replace(/[^a-zA-Z0-9]/g, '_') || `Grupo_${grupo.id_grupo}`}.pdf`;
		}

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
		res.setHeader('Content-Length', pdfBuffer.length);

		// Enviar el PDF
		res.send(pdfBuffer);

	} catch (error) {
		console.error('Error al generar CONTROL DE ASISTENCIA:', error);
		res.status(500).json({
			error: 'Error interno del servidor al generar CONTROL DE ASISTENCIA',
			details: error.message
		});
	}
};

/**
 * Genera y descarga el PDF de RECIBÍ DE DIPLOMA para un grupo
 * GET /api/grupos/:id/recibi-diploma
 */
const downloadRecibiDiploma = async (req, res) => {
	try {
		const { id } = req.params;

		if (!id) {
			return res.status(400).json({ error: 'ID de grupo requerido' });
		}

		// Obtener datos completos del grupo con alumnos
		const grupo = await prisma.grupos.findUnique({
			where: { id_grupo: parseInt(id) },
			include: {
				accionFormativa: {
					include: {
						plan: true
					}
				},
				alumnosPersonaGrupo: {
					include: {
						persona: true
					}
				}
			}
		});

		if (!grupo) {
			return res.status(404).json({ error: 'Grupo no encontrado' });
		}

		// Validar que hay alumnos en el grupo
		if (!grupo.alumnosPersonaGrupo || grupo.alumnosPersonaGrupo.length === 0) {
			return res.status(400).json({
				error: 'No se puede generar RECIBÍ DE DIPLOMA',
				details: 'El grupo no tiene alumnos asignados'
			});
		}

		// Separar número y grupo del código (ej: "12.1" -> numero: "12", grupo: "1")
		const codigoCompleto = grupo.codigo || grupo.accionFormativa?.numero_accion || '';
		const partesCodigo = codigoCompleto.split('.');
		const numeroAccion = partesCodigo[0] || '';
		const numeroGrupo = partesCodigo[1] || '';

		// Preparar datos del grupo para el PDF
		const grupoData = {
			entidadOrganizadora: 'CENTRO DE FORMACIÓN PRAXIS',
			expediente: grupo.accionFormativa?.plan?.expediente || grupo.expediente || '',
			cif: grupo.cif || 'B152625296', // CIF por defecto, se puede configurar
			denominacion: grupo.denominacion || grupo.accionFormativa?.denominacion || '',
			numero: numeroAccion,
			grupo: numeroGrupo,
			fechaInicio: grupo.fecha_inicio,
			fechaFin: grupo.fecha_fin
		};


		// Preparar datos de los alumnos
		const alumnosData = grupo.alumnosPersonaGrupo.map(alumno => ({
			apellidos: `${alumno.persona.apellido1 || ''} ${alumno.persona.apellido2 || ''}`.trim(),
			nombre: alumno.persona.nombre || '',
			documento: alumno.persona.documento || ''
		}))
		.sort((a, b) => a.apellidos.localeCompare(b.apellidos, 'es', { sensitivity: 'base' }));


		// Validar datos
		const validation = pdfService.validateRecibiDiplomaData(grupoData, alumnosData);
		if (!validation.isValid) {
			return res.status(400).json({
				error: 'Datos incompletos para generar RECIBÍ DE DIPLOMA',
				details: validation.errors
			});
		}

		// Generar el PDF
		const pdfBuffer = await pdfService.generateRecibiDiploma(grupoData, alumnosData);

		// Configurar headers para descarga
		const fileName = `Recibi_Diploma_${grupo.denominacion?.replace(/[^a-zA-Z0-9]/g, '_') || `Grupo_${grupo.id_grupo}`}.pdf`;

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
		res.setHeader('Content-Length', pdfBuffer.length);

		// Enviar el PDF
		res.send(pdfBuffer);

	} catch (error) {
		console.error('Error al generar RECIBÍ DE DIPLOMA:', error);
		res.status(500).json({
			error: 'Error interno del servidor al generar RECIBÍ DE DIPLOMA',
			details: error.message
		});
	}
};

module.exports = {
 getAllGrupos,
  getGrupoById,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  getNextGroupCodeEndpoint,
  generateFundaeInicioGrupoXML,
  generateFundaeFinGrupoXML,
  downloadRecibiMaterial,
  downloadRecibiDiploma,
  downloadControlAsistencia,
  downloadDiplomasIndividual,
  downloadDiplomasMasivo

};
