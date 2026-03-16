// Servicio de email usando Microsoft Graph API
const azureEmailService = require('../services/graphEmailService');
const azureBlobService = require('../services/azureBlobService');
const pdfService = require('../services/pdfService');
const { PrismaClient } = require('@prisma/client');
const { getCredencialesMoodle } = require('./moodleController');
const { formatDateToDDMMYYYY } = require('../utils/dateUtils');
const { TIPO_DIPLOMA, MODALIDAD_SESIONES } = require('../utils/constants');

const prisma = new PrismaClient();

/**
 * Obtiene las URLs de las imágenes para los emails
 * @returns {Object} - Objeto con las URLs de las imágenes
 */
const obtenerUrlsImagenesEmail = () => {
	const baseUrl = 'https://webappgestionformacionesprd-a2f5b0hxh0bvdqba.northeurope-01.azurewebsites.net/assets';
	return {
		imagenPrincipal: `${baseUrl}/centro-praxis-color.png`,
		imagenFirma: `${baseUrl}/centro-praxis-black.png`
	};
};

/**
 * Controlador para manejo de emails a través de Azure Communication Services
 */

/**
 * Envía un email
 * POST /api/emails/send
 */
const sendEmail = async (req, res) => {
	try {
		const { to, subject, textContent, idGrupo, idPersona, tipoEnvio } = req.body;

		// Validar campos requeridos
		if (!to || !subject || !textContent) {
			return res.status(400).json({
				error: 'Los campos to, subject y textContent son requeridos'
			});
		}

		// Opciones para el registro del email
		const options = {
			idGrupo: idGrupo || null,
			idPersona: idPersona || null,
			tipoEnvio: tipoEnvio || 'general'
		};

		// Enviar email
		const result = await azureEmailService.sendSimpleEmail(to, subject, textContent, options);

		res.status(200).json({
			message: 'Email enviado exitosamente',
			result: result
		});

	} catch (error) {
		console.error('Error al enviar email:', error);
		res.status(500).json({
			error: 'Error interno del servidor al enviar el email',
			details: error.message
		});
	}
};

/**
 * Obtiene el historial de emails enviados
 * GET /api/emails/logs
 */
const getEmailLogs = async (req, res) => {
	try {
		const {
			idGrupo,
			idPersona,
			tipoEnvio,
			enviado,
			fechaDesde,
			fechaHasta,
			page = 1,
			limit = 50
		} = req.query;

		// Construir filtros
		const where = {};

		if (idGrupo) where.id_grupo = parseInt(idGrupo);
		if (idPersona) where.id_persona = parseInt(idPersona);
		if (tipoEnvio) where.tipo_envio = tipoEnvio;
		if (enviado !== undefined) where.enviado = enviado === 'true';

		if (fechaDesde || fechaHasta) {
			where.fecha_envio = {};
			if (fechaDesde) where.fecha_envio.gte = new Date(fechaDesde);
			if (fechaHasta) where.fecha_envio.lte = new Date(fechaHasta);
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const [logs, total] = await Promise.all([
			prisma.emailLogs.findMany({
				where,
				include: {
					grupo: {
						select: {
							id_grupo: true,
							denominacion: true,
							codigo: true
						}
					},
					persona: {
						select: {
							id_persona: true,
							nombre: true,
							apellido1: true,
							apellido2: true
						}
					}
				},
				orderBy: { fecha_envio: 'desc' },
				skip,
				take: parseInt(limit)
			}),
			prisma.emailLogs.count({ where })
		]);

		res.status(200).json({
			logs,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / parseInt(limit))
			}
		});

	} catch (error) {
		console.error('Error al obtener logs de emails:', error);
		res.status(500).json({
			error: 'Error interno del servidor al obtener logs',
			details: error.message
		});
	}
};

/**
 * Obtiene estadísticas de emails por grupo
 * GET /api/emails/stats/group/:idGrupo
 */
const getEmailStatsByGroup = async (req, res) => {
	try {
		const { idGrupo } = req.params;

		const stats = await prisma.emailLogs.groupBy({
			by: ['tipo_envio', 'enviado'],
			where: { id_grupo: parseInt(idGrupo) },
			_count: { id_email_log: true }
		});

		const totalEnviados = await prisma.emailLogs.count({
			where: {
				id_grupo: parseInt(idGrupo),
				enviado: true
			}
		});

		const totalFallidos = await prisma.emailLogs.count({
			where: {
				id_grupo: parseInt(idGrupo),
				enviado: false
			}
		});

		res.status(200).json({
			grupo: idGrupo,
			estadisticas: stats,
			resumen: {
				totalEnviados,
				totalFallidos,
				totalEmails: totalEnviados + totalFallidos
			}
		});

	} catch (error) {
		console.error('Error al obtener estadísticas de emails:', error);
		res.status(500).json({
			error: 'Error interno del servidor al obtener estadísticas',
			details: error.message
		});
	}
};

/**
 * Obtiene estadísticas de emails por persona
 * GET /api/emails/stats/person/:idPersona
 */
const getEmailStatsByPerson = async (req, res) => {
	try {
		const { idPersona } = req.params;

		const stats = await prisma.emailLogs.groupBy({
			by: ['tipo_envio', 'enviado'],
			where: { id_persona: parseInt(idPersona) },
			_count: { id_email_log: true }
		});

		const totalEnviados = await prisma.emailLogs.count({
			where: {
				id_persona: parseInt(idPersona),
				enviado: true
			}
		});

		const totalFallidos = await prisma.emailLogs.count({
			where: {
				id_persona: parseInt(idPersona),
				enviado: false
			}
		});

		res.status(200).json({
			persona: idPersona,
			estadisticas: stats,
			resumen: {
				totalEnviados,
				totalFallidos,
				totalEmails: totalEnviados + totalFallidos
			}
		});

	} catch (error) {
		console.error('Error al obtener estadísticas de emails:', error);
		res.status(500).json({
			error: 'Error interno del servidor al obtener estadísticas',
			details: error.message
		});
	}
};

/**
 * Obtiene los alumnos de un grupo con su estado de emails (bienvenida y diploma)
 * GET /api/emails/group/:idGrupo/students
 */
const getGroupStudentsWithEmailStatus = async (req, res) => {
	try {
		const { idGrupo } = req.params;
		const { tipoEmail } = req.query; // 'diploma' o 'bienvenida'

		// Construir filtro según el tipo de email
		const whereClause = { id_grupo: parseInt(idGrupo) };

		// Solo filtrar por tipo Diploma si es para correo de diploma
		if (tipoEmail === 'diploma') {
			whereClause.diploma = TIPO_DIPLOMA.DIPLOMA;
		}

		// Obtener alumnos del grupo con sus datos de persona
		const alumnos = await prisma.alumnosPersonaGrupo.findMany({
			where: whereClause,
			include: {
				persona: {
					select: {
						id_persona: true,
						nombre: true,
						apellido1: true,
						apellido2: true,
						correoElectronico: true
					}
				}
			}
		});

		// Obtener logs de emails para este grupo
		const emailLogs = await prisma.emailLogs.findMany({
			where: {
				id_grupo: parseInt(idGrupo),
				tipo_envio: {
					in: ['bienvenida', 'diploma']
				}
			}
		});

		// Crear un mapa de logs por persona y tipo
		const logsMap = {};
		emailLogs.forEach(log => {
			if (log.id_persona) {
				if (!logsMap[log.id_persona]) {
					logsMap[log.id_persona] = {};
				}
				logsMap[log.id_persona][log.tipo_envio] = {
					enviado: log.enviado,
					fecha_envio: log.fecha_envio
				};
			}
		});

		// Combinar datos de alumnos con estado de emails
		const result = alumnos.map(alumno => ({
			id_alumno_grupo: alumno.id_alumno_grupo,
			id_persona: alumno.persona.id_persona,
			nombre: `${alumno.persona.nombre} ${alumno.persona.apellido1} ${alumno.persona.apellido2 || ''}`.trim(),
			email: alumno.persona.correoElectronico,
			bienvenida: {
				enviado: logsMap[alumno.persona.id_persona]?.bienvenida?.enviado || false,
				fecha_envio: logsMap[alumno.persona.id_persona]?.bienvenida?.fecha_envio || null
			},
			diploma: {
				enviado: logsMap[alumno.persona.id_persona]?.diploma?.enviado || false,
				fecha_envio: logsMap[alumno.persona.id_persona]?.diploma?.fecha_envio || null
			}
		}));

		res.status(200).json({
			grupo: idGrupo,
			alumnos: result
		});

	} catch (error) {
		console.error('Error al obtener alumnos con estado de emails:', error);
		res.status(500).json({
			error: 'Error interno del servidor al obtener datos',
			details: error.message
		});
	}
};

/**
 * Envía email de bienvenida a un alumno específico
 * POST /api/emails/send/welcome
 */
const sendWelcomeEmail = async (req, res) => {
	try {
		const { idGrupo, idPersona, email, nombre } = req.body;

		// Validar campos requeridos
		if (!idGrupo || !idPersona || !email || !nombre) {
			return res.status(400).json({
				error: 'Los campos idGrupo, idPersona, email y nombre son requeridos'
			});
		}

		// Obtener denominación del grupo y datos de la persona
		const [grupo, persona] = await Promise.all([
			prisma.grupos.findUnique({
				where: { id_grupo: parseInt(idGrupo) },
			}),
			prisma.personas.findUnique({
				where: { id_persona: parseInt(idPersona) },
				select: {
					documento: true
				}
			})
		]);

		if (!grupo) {
			return res.status(404).json({
				error: 'Grupo no encontrado'
			});
		}

		if (!persona) {
			return res.status(404).json({
				error: 'Persona no encontrada'
			});
		}

		const denominacion = grupo.denominacion;
		const fechaInicio = formatDateToDDMMYYYY(grupo.fecha_inicio, 'No especificada');
		const fechaFin = formatDateToDDMMYYYY(grupo.fecha_fin, 'No especificada');
		const idMoodle = grupo.moodle_grupo_id;

		let username = '';
		let password = '';
		try {
			const credenciales = getCredencialesMoodle(persona.documento);
			username = credenciales.username;
			password = credenciales.password;
		} catch (error) {
			console.error('Error al obtener credenciales de Moodle:', error);
		}

		// Obtener URLs de las imágenes del email
		const imagenes = obtenerUrlsImagenesEmail();

		const subject = 'Comienzo de curso';
		const textContent = `Buenos días, ${nombre}:\n\nTe doy la bienvenida al curso "${denominacion}", que comienza hoy día ${fechaInicio} y que finalizará el ${fechaFin}.\n\nPuedes acceder a la plataforma a través de la siguiente dirección:\nhttps://teleformacion.centropraxis.com\n\nPara iniciar tu sesión debes introducir tu usuario y contraseña.\nTus claves de acceso son:\nUsuario: ${username}\nContraseña: ${password}\n\nEl último paso para acceder al curso es hacer clic sobre el enlace.\n\nSaludos cordiales,\nEquipo de Formación`;
		let htmlContent = `
    <html>
    <head>
      <style>
        .highlight {
          color: #C40000;
          font-size: 16px;
          font-weight: bold;
        }
        .highlight-small {
          color: #C40000;
          font-size: 14px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
    <h1>Bienvenido al curso</h1>`;

		// Imagen principal (cabecera)
		if (imagenes.imagenPrincipal) {
			htmlContent += `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${imagenes.imagenPrincipal}" alt="Logo de Praxis" style="max-width: 200px; height: auto;" />
      </div>
      <hr style="border: none; border-top: 1px solid #1B3B6F; margin: 20px 0;">`;
		}
		htmlContent += `
    <p>Buenos días, <span class="highlight">${nombre}</span>:</p>
    <p>Te doy la bienvenida al curso <span class="highlight">${denominacion}</span>, que comienza hoy día <span class="highlight-small">${fechaInicio}</span> y que finalizará el <span class="highlight-small">${fechaFin}</span>.</p>
    <p>Puedes acceder a la plataforma a través de la siguiente dirección:</p>
    <a href="https://teleformacion.centropraxis.com/course/view.php?id=${idMoodle}">https://teleformacion.centropraxis.com</a>
    <p>Para iniciar tu sesión debes introducir tu usuario y contraseña. <br>Tus claves de acceso son:</p>
    <p>Usuario: <span class="highlight">${username}</span></p>
    <p>Contraseña: <span class="highlight">${password}</span></p>
      <p>El último paso para acceder al curso es hacer clic sobre el enlace.</p>
      <br>
      <hr style="border: none; border-top: 1px solid #757575; margin: 20px 0;">
      <p><span class="highlight">¡Muchísimo ánimo con el curso!</span></p>
      <p>Estamos a tu disposición para cualquier consulta que quieras hacer.</p>
      <p>Un saludo.</p>
      <hr style="border: none; border-top: 1px solid #757575; margin: 20px 0;">`;

		// Imagen de firma
		if (imagenes.imagenFirma) {
			htmlContent += `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${imagenes.imagenFirma}" alt="Firma de Praxis" style="max-width: 150px; height: auto;" />
      </div>`;
		}

		htmlContent += `
    </body>
    </html>`;
		const result = await azureEmailService.sendEmailWithHTML(email, subject, textContent, htmlContent, {
			idGrupo: parseInt(idGrupo),
			idPersona: parseInt(idPersona),
			tipoEnvio: 'bienvenida'
		});

		res.status(200).json({
			message: 'Email de bienvenida enviado exitosamente',
			result: result
		});

	} catch (error) {
		console.error('Error al enviar email de bienvenida:', error);
		res.status(500).json({
			error: 'Error interno del servidor al enviar el email de bienvenida',
			details: error.message
		});
	}
};

/**
 * Envía email de diploma a un alumno específico
 * POST /api/emails/send/diploma
 */
const sendDiplomaEmail = async (req, res) => {
	try {
		const { idGrupo, idPersona, email, nombre } = req.body;

		// Validar campos requeridos
		if (!idGrupo || !idPersona || !email || !nombre) {
			return res.status(400).json({
				error: 'Los campos idGrupo, idPersona, email y nombre son requeridos'
			});
		}

		// Obtener datos completos del alumno y grupo
		const [alumno, grupo, archivosAdjuntos] = await Promise.all([
			prisma.personas.findUnique({
				where: { id_persona: parseInt(idPersona) },
				select: {
					id_persona: true,
					nombre: true,
					apellido1: true,
					apellido2: true,
					documento: true,
					correoElectronico: true
				}
			}),
			prisma.grupos.findUnique({
				where: { id_grupo: parseInt(idGrupo) },
				select: {
					id_grupo: true,
					denominacion: true,
					horas_totales_presencial_horario: true,
					horas_totales_teleformacion: true,
					fecha_inicio: true,
					fecha_fin: true,
					accionFormativa: {
						select: {
							modalidad: true,
							horas_modalidad_presencial: true,
							horas_modalidad_teleformacion: true,
							horas_totales_diploma: true,
							desglose_horas_diploma: true,
							modalidad_diploma: true
						}
					},
					centro_nombre: true,
					centro_direccion: true,
					centro_codPostal: true,
					centro_localidad: true,
					tele_centro_nombre: true,
					tele_centro_direccion: true,
					tele_centro_codPostal: true,
					tele_centro_localidad: true,
					num_homologacion_seguridad: true,
					lugar_fecha_diploma: true
				}
			}),
			prisma.documentacionAdjGrupo.findMany({
				where: {
					id_grupo: parseInt(idGrupo),
					tipo_documento: 'trasera'
				}
			})
		]);

		if (!alumno) {
			return res.status(404).json({
				error: 'Alumno no encontrado'
			});
		}

		if (!grupo) {
			return res.status(404).json({
				error: 'Grupo no encontrado'
			});
		}

		// Validar que existe parte trasera para el grupo
		if (archivosAdjuntos.length === 0) {
			return res.status(400).json({
				error: 'No se puede enviar email de diploma',
				details: 'El grupo no tiene parte trasera configurada. Debe añadir una parte trasera antes de enviar diplomas.'
			});
		}

		// Preparar datos para el diploma
		const alumnoData = {
			nombre: `${alumno.nombre} ${alumno.apellido1} ${alumno.apellido2 || ''}`.trim(),
			documento: alumno.documento
		};

		// Calcular horas totales: usar horas_totales_diploma si existe, sino la suma de presencial + teleformación
		const horasPresencial = grupo.accionFormativa?.horas_modalidad_presencial ?? 0;
		const horasTeleformacion = grupo.accionFormativa?.horas_modalidad_teleformacion ?? 0;
		const horasTotales = grupo.accionFormativa?.horas_totales_diploma
			? grupo.accionFormativa.horas_totales_diploma
			: (horasPresencial + horasTeleformacion);
		
		// Determinar qué campos de centro usar según la modalidad
		// Reglas:
		// - Si es teleformación → usar tele_centro_*
		// - Si es mixta o presencial → usar centro_* (presencial)
		const modalidad = grupo.accionFormativa?.modalidad;
		const usarTeleformacion = modalidad === MODALIDAD_SESIONES.TELEFORMACION && grupo.tele_centro_nombre && grupo.tele_centro_nombre.trim() !== '';
		
		const centroNombre = usarTeleformacion 
			? grupo.tele_centro_nombre 
			: grupo.centro_nombre;
		
		// Construir dirección completa con los campos disponibles
		const construirDireccion = (direccion, codPostal, localidad) => {
			const partes = [];
			if (direccion && direccion.trim()) partes.push(direccion.trim());
			if (codPostal && codPostal.trim()) partes.push(codPostal.trim());
			if (localidad && localidad.trim()) partes.push(localidad.trim());
			return partes.join(', ');
		};
		
		const centroDireccion = usarTeleformacion
			? construirDireccion(grupo.tele_centro_direccion, grupo.tele_centro_codPostal, grupo.tele_centro_localidad)
			: construirDireccion(grupo.centro_direccion, grupo.centro_codPostal, grupo.centro_localidad);
		
		const grupoData = {
			denominacion: grupo.denominacion,
			horas: horasTotales,
			modalidad: grupo.accionFormativa?.modalidad,
			centro: centroNombre,
			direccion: centroDireccion,
			fechaInicio: formatDateToDDMMYYYY(grupo.fecha_inicio, 'No especificada'),
			fechaFin: formatDateToDDMMYYYY(grupo.fecha_fin, 'No especificada'),
			numHomologacionSeguridad: grupo.num_homologacion_seguridad || null,
			desgloseHorasDiploma: grupo.accionFormativa?.desglose_horas_diploma || null,
			modalidadDiploma: grupo.accionFormativa?.modalidad_diploma || null,
			lugarFechaDiploma: grupo.lugar_fecha_diploma || null
		};

		// Validar datos del diploma
		const validation = pdfService.validateDiplomaData(alumnoData, grupoData);
		if (!validation.isValid) {
			// Agregar información adicional sobre las horas si el error es por horas
			const errorDetails = [...validation.errors];
			if (horasTotales <= 0) {
				errorDetails.push(`Horas presencial: ${horasPresencial ?? 'no asignada'}, Horas teleformación: ${horasTeleformacion ?? 'no asignada'}`);
			}
			return res.status(400).json({
				error: 'Datos incompletos para generar diploma',
				details: errorDetails
			});
		}

		let diplomaBuffer = null;
		let diplomaFileName = null;

		// Generar diploma personalizado si hay trasera disponible
		if (archivosAdjuntos.length > 0) {
			try {
				// Descargar la trasera del grupo
				const traseraBuffer = await azureBlobService.downloadFile(archivosAdjuntos[0].nombre_archivo_blob);

				// Generar diploma completo (delantera + trasera)
				diplomaBuffer = await pdfService.generateCompleteDiploma(alumnoData, grupoData, traseraBuffer);

				// Generar nombre único para el diploma
				const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
				diplomaFileName = `diploma-${alumnoData.nombre.replace(/\s+/g, '_')}-${timestamp}.pdf`;

				// Guardar diploma en blob storage
				await azureBlobService.uploadFile(
					diplomaBuffer,
					diplomaFileName,
					'application/pdf',
					`diplomas/grupo-${idGrupo}/`
				);
			} catch (error) {
				console.error('Error al generar diploma personalizado:', error);
				// Continuar sin diploma personalizado
			}
		}

		// Obtener URLs de las imágenes del email
		const imagenes = obtenerUrlsImagenesEmail();

		// Crear contenido del email de diploma
		const subject = 'Diploma del curso';
		let textContent = `Hola, ${alumnoData.nombre}:\n\nHas finalizado la acción formativa "${grupoData.denominacion}", con fecha de inicio "${grupoData.fechaInicio}" y fecha de finalización "${grupoData.fechaFin}". Tu acreditación está disponible adjunta en este email.\n\nSaludos cordiales,\nEquipo de Formación`;
		let htmlContent = `
    <html>
    <head>
      <style>
        .highlight {
          color: #C40000;
          font-size: 16px;
          font-weight: bold;
        }
        .highlight-small {
          color: #C40000;
          font-size: 14px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
    <h1>Diploma del curso</h1>`;

		// Imagen principal (cabecera)
		if (imagenes.imagenPrincipal) {
			htmlContent += `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${imagenes.imagenPrincipal}" alt="Logo de Praxis" style="max-width: 200px; height: auto;" />
      </div>
      <hr style="border: none; border-top: 1px solid #1B3B6F; margin: 20px 0;">`;
		}

		htmlContent += `
    <p>Hola, <span class="highlight">${alumnoData.nombre}</span>:</p>
    <p>Has finalizado la acción formativa <span class="highlight">"${grupoData.denominacion}"</span>, con fecha de inicio <span class="highlight-small">${grupoData.fechaInicio}</span> 
    y fecha de finalización <span class="highlight-small">${grupoData.fechaFin}</span>.</p>
    <p>Tu acreditación está disponible adjunta en este email.</p>
    <hr style="border: none; border-top: 1px solid #757575; margin: 20px 0;">
    <p><span class="highlight">¡Muchas gracias por participar en esta acción formativa!</span></p>
    <p>Esperamos que haya respondido a tus expectativas.</p>
    <p>Un saludo.</p>
    <hr style="border: none; border-top: 1px solid #757575; margin: 20px 0;">`;

		// Imagen de firma
		if (imagenes.imagenFirma) {
			htmlContent += `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${imagenes.imagenFirma}" alt="Firma de Praxis" style="max-width: 150px; height: auto;" />
      </div>`;
		}

		htmlContent += `
    </body>
    </html>`;
		// Procesar adjuntos
		const attachments = [];

		// Si se generó un diploma personalizado, adjuntarlo
		if (diplomaBuffer && diplomaFileName) {
			const base64Content = diplomaBuffer.toString('base64');
			attachments.push({
				name: `Diploma_${alumnoData.nombre.replace(/\s+/g, '_')}.pdf`,
				contentType: 'application/pdf',
				contentInBase64: base64Content
			});
		}
		// Si no hay diploma personalizado pero hay trasera, adjuntar la trasera
		else if (archivosAdjuntos.length > 0) {
			try {
				const fileBuffer = await azureBlobService.downloadFile(archivosAdjuntos[0].nombre_archivo_blob);
				const base64Content = fileBuffer.toString('base64');

				attachments.push({
					name: archivosAdjuntos[0].nombre_archivo,
					contentType: 'application/pdf',
					contentInBase64: base64Content
				});
			} catch (error) {
				console.error(`Error procesando archivo ${archivosAdjuntos[0].nombre_archivo}:`, error);
			}
		}

		// Enviar email con o sin adjuntos
		let result;
		if (attachments.length > 0) {
			result = await azureEmailService.sendEmailWithAttachmentsSDK(email, subject, textContent, attachments, htmlContent, {
				idGrupo: parseInt(idGrupo),
				idPersona: parseInt(idPersona),
				tipoEnvio: 'diploma'
			});
		} else {
			result = await azureEmailService.sendEmailWithHTML(email, subject, textContent, htmlContent, {
				idGrupo: parseInt(idGrupo),
				idPersona: parseInt(idPersona),
				tipoEnvio: 'diploma'
			});
		}

		res.status(200).json({
			message: 'Email de diploma enviado exitosamente',
			result: result,
			diplomaGenerated: !!diplomaBuffer,
			diplomaFileName: diplomaFileName
		});

	} catch (error) {
		console.error('Error al enviar email de diploma:', error);
		res.status(500).json({
			error: 'Error interno del servidor al enviar el email de diploma',
			details: error.message
		});
	}
};

/**
 * Descarga un diploma generado para un alumno específico
 * GET /api/emails/diploma/:idGrupo/:idPersona
 */
const downloadDiploma = async (req, res) => {
	try {
		const { idGrupo, idPersona } = req.params;

		// Validar parámetros
		if (!idGrupo || !idPersona) {
			return res.status(400).json({
				error: 'Los parámetros idGrupo e idPersona son requeridos'
			});
		}

		// Obtener datos del alumno
		const alumno = await prisma.personas.findUnique({
			where: { id_persona: parseInt(idPersona) },
			select: {
				id_persona: true,
				nombre: true,
				apellido1: true,
				apellido2: true,
				documento: true
			}
		});

		if (!alumno) {
			return res.status(404).json({
				error: 'Alumno no encontrado'
			});
		}

		try {
			// Listar archivos en el directorio del grupo
			const files = await azureBlobService.listFiles(`diplomas/grupo-${idGrupo}/`);

			const nombreCompleto = `${alumno.nombre} ${alumno.apellido1} ${alumno.apellido2 || ''}`.trim();

			const nombreNormalizado = nombreCompleto
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.replace(/[^\w\s.-]/g, '_')
				.replace(/\s+/g, '_');

			const searchPattern = `diploma-${nombreNormalizado}`;

			// Buscar el diploma más reciente para este alumno
			const alumnoDiplomas = files.filter(file =>
				file.name.includes(searchPattern)
			);

			if (alumnoDiplomas.length === 0) {
				return res.status(404).json({
					error: 'No se encontró diploma generado para este alumno'
				});
			}

			// Obtener el diploma más reciente (por fecha de modificación)
			const latestDiploma = alumnoDiplomas.sort((a, b) =>
				new Date(b.lastModified) - new Date(a.lastModified)
			)[0];

			// Generar URL firmada para descarga
			const signedUrl = azureBlobService.generateSignedUrl(latestDiploma.name, 60);

			res.status(200).json({
				message: 'Diploma encontrado',
				downloadUrl: signedUrl,
				fileName: latestDiploma.name,
				size: latestDiploma.size,
				lastModified: latestDiploma.lastModified
			});

		} catch (error) {
			console.error('Error al buscar diploma:', error);
			return res.status(500).json({
				error: 'Error al buscar el diploma',
				details: error.message
			});
		}

	} catch (error) {
		console.error('Error al descargar diploma:', error);
		res.status(500).json({
			error: 'Error interno del servidor al descargar el diploma',
			details: error.message
		});
	}
};

module.exports = {
	sendEmail,
	getEmailLogs,
	getEmailStatsByGroup,
	getEmailStatsByPerson,
	getGroupStudentsWithEmailStatus,
	sendWelcomeEmail,
	sendDiplomaEmail,
	downloadDiploma
};