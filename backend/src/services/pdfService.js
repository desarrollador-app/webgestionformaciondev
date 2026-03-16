const fs = require('fs');
const path = require('path');

// CRÍTICO: Configurar PDFKIT_DATA_PATH ANTES de importar pdfkit
// pdfkit lee esta variable de entorno cuando se importa por primera vez
if (!process.env.PDFKIT_DATA_PATH) {
	// Intentar diferentes ubicaciones posibles en orden de prioridad
	const possiblePaths = [
		// Azure App Service Windows (producción)
		'C:\\home\\site\\wwwroot\\node_modules\\pdfkit\\js\\data',
		// Azure App Service Linux (producción)
		'/home/site/wwwroot/node_modules/pdfkit/js/data',
		// Desarrollo local - desde el servicio
		path.join(__dirname, '../../node_modules/pdfkit/js/data'),
		// Desarrollo local - desde el directorio raíz del backend
		path.join(__dirname, '../../../node_modules/pdfkit/js/data'),
		// Desde process.cwd() (último recurso)
		path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data')
	];

	// Buscar la primera ruta que exista y que contenga los archivos de fuentes
	for (const dataPath of possiblePaths) {
		try {
			const helveticaPath = path.join(dataPath, 'Helvetica.afm');
			if (fs.existsSync(dataPath) && fs.existsSync(helveticaPath)) {
				process.env.PDFKIT_DATA_PATH = dataPath;
				console.log(`✓ PDFKIT_DATA_PATH configurado en: ${dataPath}`);
				console.log(`✓ Verificado: Helvetica.afm existe en la ruta configurada`);
				break;
			}
		} catch (error) {
			// Continuar con la siguiente ruta si hay error
			continue;
		}
	}

	// Si no se encontró ninguna ruta válida, usar la ruta de Azure Windows como fallback
	if (!process.env.PDFKIT_DATA_PATH) {
		const fallbackPath = 'C:\\home\\site\\wwwroot\\node_modules\\pdfkit\\js\\data';
		process.env.PDFKIT_DATA_PATH = fallbackPath;
		console.warn(`PDFKIT_DATA_PATH no encontrado en ninguna ubicación, usando fallback: ${fallbackPath}`);
		console.warn(`Asegúrate de que los archivos de fuentes estén en: ${fallbackPath}`);
	} else {
		// Verificación final: confirmar que el archivo existe
		const helveticaPath = path.join(process.env.PDFKIT_DATA_PATH, 'Helvetica.afm');
		if (!fs.existsSync(helveticaPath)) {
			console.error(`ERROR: Helvetica.afm no encontrado en: ${process.env.PDFKIT_DATA_PATH}`);
			console.error(`La ruta configurada puede ser incorrecta`);
		}
	}
}

// Ahora importar pdfkit (después de configurar PDFKIT_DATA_PATH)
const PDFDocument = require('pdfkit');
const { PDFDocument: PDFLib } = require('pdf-lib');

/**
 * Obtiene la ruta correcta a la carpeta assets
 * En desarrollo: __dirname = src/services/, entonces ../../assets/
 * En producción: __dirname = dist/ (después de esbuild), entonces ./assets/
 */
function getAssetsPath() {
	// Intentar primero la ruta de producción (dist/assets/)
	const productionPath = path.join(__dirname, 'assets');
	if (fs.existsSync(productionPath)) {
		return productionPath;
	}
	// Si no existe, usar la ruta de desarrollo (../../assets/)
	return path.join(__dirname, '../../assets');
}

/**
 * Servicio para generación y manipulación de PDFs de diplomas
 * 
 * Este servicio proporciona funcionalidades para:
 * - Generar PDFs personalizados con datos del alumno
 * - Combinar PDFs (delantera + trasera)
 * - Crear diplomas completos
 */

class PDFService {
	constructor() {
		this.defaultFont = 'Helvetica';
		this.titleFont = 'Helvetica-Bold';
	}

	/**
	 * Genera el PDF de RECIBÍ DE MATERIAL basado en la plantilla
	 * @param {Object} grupoData - Datos del grupo
	 * @param {Array} alumnosData - Array de datos de alumnos
	 * @returns {Promise<Buffer>} - Buffer del PDF generado
	 */
	async generateRecibiMaterial(grupoData, alumnosData) {
		return new Promise((resolve, reject) => {
			try {
				const doc = new PDFDocument({
					size: 'A4',
					layout: 'portrait',
					margins: {
						top: 20,
						bottom: 20,
						left: 20,
						right: 20
					}
				});

				const buffers = [];
				doc.on('data', buffers.push.bind(buffers));
				doc.on('end', () => {
					const pdfBuffer = Buffer.concat(buffers);
					resolve(pdfBuffer);
				});

				// Configurar colores
				const primaryColor = '#1e3a8a'; // Azul oscuro
				const textColor = '#374151'; // Gris oscuro

				// Logo/Header - Cargar imagen del logo
				try {
					const logoPath = path.join(getAssetsPath(), 'praxislogo.png');
					if (fs.existsSync(logoPath)) {
						doc.image(logoPath, 30, 30, {
							width: 100
						});
					} else {
						// Fallback al texto si no existe la imagen
						doc.fontSize(16)
							.fillColor(primaryColor)
							.text('praxis', 30, 40);

						doc.fontSize(9)
							.fillColor('white')
							.text('centro de formación', 30, 55, {
								backgroundColor: primaryColor,
								padding: 2
							});
					}
				} catch (error) {
					console.error('Error cargando logo:', error);
					// Fallback al texto en caso de error
					doc.fontSize(16)
						.fillColor(primaryColor)
						.text('praxis', 30, 40);

					doc.fontSize(9)
						.fillColor('white')
						.text('centro de formación', 30, 55, {
							backgroundColor: primaryColor,
							padding: 2
						});
				}

				// Título principal
				doc.fontSize(20)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('RECIBÍ DE MATERIAL', 30, 100, { align: 'center' });

				// Sección OPCIÓN C - Entidad Organizadora
				const sectionY = 130;
				doc.rect(30, sectionY, 555, 45)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				doc.fontSize(10)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('OPCIÓN C:', 40, sectionY + 8);

				doc.fontSize(9)
					.fillColor(textColor)
					.font('Helvetica-Bold')
					.text('ENTIDAD ORGANIZADORA:', 40, sectionY + 18)
					.font('Helvetica')
					.text(grupoData.entidadOrganizadora || 'CENTRO DE FORMACIÓN PRAXIS', 200, sectionY + 18);

				doc.font('Helvetica-Bold')
					.text('EXPEDIENTE:', 40, sectionY + 30)
					.font('Helvetica')
					.text(grupoData.expediente || '', 200, sectionY + 30);

				doc.font('Helvetica-Bold')
					.text('CIF.:', 400, sectionY + 30)
					.font('Helvetica')
					.text(grupoData.cif || 'B152625296', 420, sectionY + 30);

				// Nota explicativa
				doc.fontSize(7)
					.fillColor('#6b7280')
					.font('Helvetica-Oblique')
					.text('(Se seleccionará uno de los apartados anteriores dependiendo del perfil con el que se haya accedido al Sistema telemático de Formación Programada por las Empresas)', 40, sectionY + 50, { width: 540 });

				// Sección de datos de la acción formativa
				const accionY = sectionY + 70;
				doc.rect(30, accionY, 555, 60)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				doc.fontSize(10)
					.fillColor(textColor)
					.font('Helvetica-Bold')
					.text('DENOMINACIÓN DE LA ACCIÓN FORMATIVA:', 40, accionY + 8)
					.font('Helvetica')
					.text(grupoData.denominacion || '', 40, accionY + 18, { width: 520 });

				doc.font('Helvetica-Bold')
					.text('N°:', 40, accionY + 32)
					.font('Helvetica')
					.text(grupoData.numero || '', 70, accionY + 32);

				doc.font('Helvetica-Bold')
					.text('GRUPO:', 180, accionY + 32)
					.font('Helvetica')
					.text(grupoData.grupo || '', 220, accionY + 32);

				doc.font('Helvetica-Bold')
					.text('FECHA DE INICIO:', 40, accionY + 44)
					.font('Helvetica')
					.text(this.formatDateForTemplate(grupoData.fechaInicio), 170, accionY + 44);

				doc.font('Helvetica-Bold')
					.text('FECHA FIN:', 350, accionY + 44)
					.font('Helvetica')
					.text(this.formatDateForTemplate(grupoData.fechaFin), 420, accionY + 44);

				// Texto de certificación
				doc.fontSize(9)
					.fillColor(textColor)
					.font('Helvetica')
					.text('Los participantes abajo firmantes certifican que han recibido manual y bolígrafo', 40, accionY + 68);

				// Tabla de participantes
				const tableY = accionY + 90;
				const tableWidth = 555;
				const colWidths = [120, 120, 120, 195]; // APELLIDOS, NOMBRE, N.I.F., FIRMAS

				// Header principal de la tabla
				doc.rect(30, tableY, tableWidth, 20)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Línea vertical para separar "DATOS DE LOS ASISTENTES" de "FIRMAS"
				doc.moveTo(30 + 360, tableY)
					.lineTo(30 + 360, tableY + 20)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Header principal
				doc.fontSize(10)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('DATOS DE LOS ASISTENTES', 40, tableY + 6, { width: 320, align: 'center' });
				doc.text('FIRMAS', 400, tableY + 6, { width: 180, align: 'center' });

				// Subheaders
				const subHeaderY = tableY + 20;
				doc.rect(30, subHeaderY, tableWidth, 18)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Líneas verticales para subheaders
				let currentX = 30;
				for (let i = 0; i < colWidths.length; i++) {
					currentX += colWidths[i];
					if (i < colWidths.length - 1) {
						doc.moveTo(currentX, subHeaderY)
							.lineTo(currentX, subHeaderY + 18)
							.strokeColor(primaryColor)
							.lineWidth(1)
							.stroke();
					}
				}

				doc.fontSize(9)
					.fillColor(textColor)
					.font('Helvetica-Bold')
					.text('APELLIDOS', 40, subHeaderY + 6, { width: 120, align: 'center' });
				doc.text('NOMBRE', 160, subHeaderY + 6, { width: 120, align: 'center' });
				doc.text('N.I.F.', 280, subHeaderY + 6, { width: 120, align: 'center' });
				doc.text('FIRMAS', 400, subHeaderY + 6, { width: 180, align: 'center' });

				// Filas de alumnos (15 filas en página 1)
				let currentRowY = subHeaderY + 18;
				const rowHeight = 30; // Aumentado aún más para mejor legibilidad

				// Crear 15 filas en la primera página
				for (let i = 0; i < 15; i++) {
					// Dibujar fila
					doc.rect(30, currentRowY, tableWidth, rowHeight)
						.strokeColor(primaryColor)
						.lineWidth(1)
						.stroke();

					// Líneas verticales
					currentX = 30;
					for (let j = 0; j < colWidths.length; j++) {
						currentX += colWidths[j];
						if (j < colWidths.length - 1) {
							doc.moveTo(currentX, currentRowY)
								.lineTo(currentX, currentRowY + rowHeight)
								.strokeColor(primaryColor)
								.lineWidth(1)
								.stroke();
						}
					}

					// Número de fila
					doc.fontSize(9)
						.fillColor(textColor)
						.font('Helvetica')
						.text((i + 1).toString(), 35, currentRowY + 12);

					// Datos del alumno (si existe)
					if (i < alumnosData.length && alumnosData[i]) {
						doc.fontSize(9)
							.fillColor(textColor)
							.font('Helvetica')
							.text(alumnosData[i].apellidos || '', 50, currentRowY + 12, { width: 110 });
						doc.text(alumnosData[i].nombre || '', 170, currentRowY + 12, { width: 110 });
						doc.text(alumnosData[i].documento || '', 290, currentRowY + 12, { width: 110 });
					}
					// Columna de firmas se deja vacía

					currentRowY += rowHeight;
				}

				// Crear página 2
				doc.addPage();

				// Solo cabecera de la tabla en página 2
				const tableY2 = 50;

				// Header principal de la tabla página 2
				doc.rect(30, tableY2, tableWidth, 20)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Línea vertical para separar "DATOS DE LOS ASISTENTES" de "FIRMAS"
				doc.moveTo(30 + 360, tableY2)
					.lineTo(30 + 360, tableY2 + 20)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Header principal
				doc.fontSize(10)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('DATOS DE LOS ASISTENTES', 40, tableY2 + 6, { width: 320, align: 'center' });
				doc.text('FIRMAS', 400, tableY2 + 6, { width: 180, align: 'center' });

				// Subheaders página 2
				const subHeaderY2 = tableY2 + 20;
				doc.rect(30, subHeaderY2, tableWidth, 18)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Líneas verticales para subheaders
				currentX = 30;
				for (let i = 0; i < colWidths.length; i++) {
					currentX += colWidths[i];
					if (i < colWidths.length - 1) {
						doc.moveTo(currentX, subHeaderY2)
							.lineTo(currentX, subHeaderY2 + 18)
							.strokeColor(primaryColor)
							.lineWidth(1)
							.stroke();
					}
				}

				doc.fontSize(9)
					.fillColor(textColor)
					.font('Helvetica-Bold')
					.text('APELLIDOS', 40, subHeaderY2 + 6, { width: 120, align: 'center' });
				doc.text('NOMBRE', 160, subHeaderY2 + 6, { width: 120, align: 'center' });
				doc.text('N.I.F.', 280, subHeaderY2 + 6, { width: 120, align: 'center' });
				doc.text('FIRMAS', 400, subHeaderY2 + 6, { width: 180, align: 'center' });

				// Filas de alumnos página 2 (filas 16-30)
				let currentRowY2 = subHeaderY2 + 18;

				// Crear 15 filas en la segunda página (filas 16-30)
				for (let i = 15; i < 30; i++) {
					// Dibujar fila
					doc.rect(30, currentRowY2, tableWidth, rowHeight)
						.strokeColor(primaryColor)
						.lineWidth(1)
						.stroke();

					// Líneas verticales
					currentX = 30;
					for (let j = 0; j < colWidths.length; j++) {
						currentX += colWidths[j];
						if (j < colWidths.length - 1) {
							doc.moveTo(currentX, currentRowY2)
								.lineTo(currentX, currentRowY2 + rowHeight)
								.strokeColor(primaryColor)
								.lineWidth(1)
								.stroke();
						}
					}

					// Número de fila
					doc.fontSize(9)
						.fillColor(textColor)
						.font('Helvetica')
						.text((i + 1).toString(), 35, currentRowY2 + 12);

					// Datos del alumno (si existe)
					if (i < alumnosData.length && alumnosData[i]) {
						doc.fontSize(9)
							.fillColor(textColor)
							.font('Helvetica')
							.text(alumnosData[i].apellidos || '', 50, currentRowY2 + 12, { width: 110 });
						doc.text(alumnosData[i].nombre || '', 170, currentRowY2 + 12, { width: 110 });
						doc.text(alumnosData[i].documento || '', 290, currentRowY2 + 12, { width: 110 });
					}
					// Columna de firmas se deja vacía

					currentRowY2 += rowHeight;
				}

				// Recuadro de OBSERVACIONES GENERALES
				const observacionesY = currentRowY2 + 20;
				const observacionesHeight = 120; // Aumentado para mejor aprovechamiento del espacio

				doc.rect(30, observacionesY, 555, observacionesHeight)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				doc.fontSize(11)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('OBSERVACIONES GENERALES:', 40, observacionesY + 15);

				doc.end();
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Genera el PDF de RECIBÍ DE DIPLOMA basado en la plantilla
	 * @param {Object} grupoData - Datos del grupo
	 * @param {Array} alumnosData - Array de datos de alumnos
	 * @returns {Promise<Buffer>} - Buffer del PDF generado
	 */
	async generateRecibiDiploma(grupoData, alumnosData) {
		return new Promise((resolve, reject) => {
			try {
				const doc = new PDFDocument({
					size: 'A4',
					layout: 'portrait',
					margins: {
						top: 20,
						bottom: 20,
						left: 20,
						right: 20
					}
				});

				const buffers = [];
				doc.on('data', buffers.push.bind(buffers));
				doc.on('end', () => {
					const pdfBuffer = Buffer.concat(buffers);
					resolve(pdfBuffer);
				});

				// Configurar colores
				const primaryColor = '#1e3a8a'; // Azul oscuro
				const textColor = '#374151'; // Gris oscuro

				// Logo/Header - Cargar imagen del logo
				try {
					const logoPath = path.join(getAssetsPath(), 'praxislogo.png');
					if (fs.existsSync(logoPath)) {
						doc.image(logoPath, 30, 30, {
							width: 100
						});
					} else {
						// Fallback al texto si no existe la imagen
						doc.fontSize(16)
							.fillColor(primaryColor)
							.text('praxis', 30, 40);

						doc.fontSize(9)
							.fillColor('white')
							.text('centro de formación', 30, 55, {
								backgroundColor: primaryColor,
								padding: 2
							});
					}
				} catch (error) {
					console.error('Error cargando logo:', error);
					// Fallback al texto en caso de error
					doc.fontSize(16)
						.fillColor(primaryColor)
						.text('praxis', 30, 40);

					doc.fontSize(9)
						.fillColor('white')
						.text('centro de formación', 30, 55, {
							backgroundColor: primaryColor,
							padding: 2
						});
				}

				// Título principal
				doc.fontSize(20)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('RECIBÍ DE DIPLOMA', 30, 100, { align: 'center' });

				// Sección OPCIÓN C - Entidad Organizadora
				const sectionY = 130;
				doc.rect(30, sectionY, 555, 45)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				doc.fontSize(10)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('OPCIÓN C:', 40, sectionY + 8);

				doc.fontSize(9)
					.fillColor(textColor)
					.font('Helvetica-Bold')
					.text('ENTIDAD ORGANIZADORA:', 40, sectionY + 18)
					.font('Helvetica')
					.text(grupoData.entidadOrganizadora || 'CENTRO DE FORMACIÓN PRAXIS', 200, sectionY + 18);

				doc.font('Helvetica-Bold')
					.text('EXPEDIENTE:', 40, sectionY + 30)
					.font('Helvetica')
					.text(grupoData.expediente || '', 200, sectionY + 30);

				doc.font('Helvetica-Bold')
					.text('CIF.:', 400, sectionY + 30)
					.font('Helvetica')
					.text(grupoData.cif || 'B152625296', 420, sectionY + 30);

				// Nota explicativa
				doc.fontSize(7)
					.fillColor('#6b7280')
					.font('Helvetica-Oblique')
					.text('(Se seleccionará uno de los apartados anteriores dependiendo del perfil con el que se haya accedido al Sistema telemático de Formación Programada por las Empresas)', 40, sectionY + 50, { width: 540 });

				// Sección de datos de la acción formativa
				const accionY = sectionY + 70;
				doc.rect(30, accionY, 555, 60)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				doc.fontSize(10)
					.fillColor(textColor)
					.font('Helvetica-Bold')
					.text('DENOMINACIÓN DE LA ACCIÓN FORMATIVA:', 40, accionY + 8)
					.font('Helvetica')
					.text(grupoData.denominacion || '', 40, accionY + 18, { width: 520 });

				doc.font('Helvetica-Bold')
					.text('N°:', 40, accionY + 32)
					.font('Helvetica')
					.text(grupoData.numero || '', 70, accionY + 32);

				doc.font('Helvetica-Bold')
					.text('GRUPO:', 180, accionY + 32)
					.font('Helvetica')
					.text(grupoData.grupo || '', 220, accionY + 32);

				doc.font('Helvetica-Bold')
					.text('FECHA DE INICIO:', 40, accionY + 44)
					.font('Helvetica')
					.text(this.formatDateForTemplate(grupoData.fechaInicio), 170, accionY + 44);

				doc.font('Helvetica-Bold')
					.text('FECHA FIN:', 350, accionY + 44)
					.font('Helvetica')
					.text(this.formatDateForTemplate(grupoData.fechaFin), 420, accionY + 44);

				// Texto de certificación
				doc.fontSize(9)
					.fillColor(textColor)
					.font('Helvetica')
					.text('Los participantes abajo firmantes certifican que han recibido diploma', 40, accionY + 68);

				// Tabla de participantes
				const tableY = accionY + 90;
				const tableWidth = 555;
				const colWidths = [120, 120, 120, 195]; // APELLIDOS, NOMBRE, N.I.F., FIRMAS

				// Header principal de la tabla
				doc.rect(30, tableY, tableWidth, 20)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Línea vertical para separar "DATOS DE LOS ASISTENTES" de "FIRMAS"
				doc.moveTo(30 + 360, tableY)
					.lineTo(30 + 360, tableY + 20)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Header principal
				doc.fontSize(10)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('DATOS DE LOS ASISTENTES', 40, tableY + 6, { width: 320, align: 'center' });
				doc.text('FIRMAS', 400, tableY + 6, { width: 180, align: 'center' });

				// Subheaders
				const subHeaderY = tableY + 20;
				doc.rect(30, subHeaderY, tableWidth, 18)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Líneas verticales para subheaders
				let currentX = 30;
				for (let i = 0; i < colWidths.length; i++) {
					currentX += colWidths[i];
					if (i < colWidths.length - 1) {
						doc.moveTo(currentX, subHeaderY)
							.lineTo(currentX, subHeaderY + 18)
							.strokeColor(primaryColor)
							.lineWidth(1)
							.stroke();
					}
				}

				doc.fontSize(9)
					.fillColor(textColor)
					.font('Helvetica-Bold')
					.text('APELLIDOS', 40, subHeaderY + 6, { width: 120, align: 'center' });
				doc.text('NOMBRE', 160, subHeaderY + 6, { width: 120, align: 'center' });
				doc.text('N.I.F.', 280, subHeaderY + 6, { width: 120, align: 'center' });
				doc.text('FIRMAS', 400, subHeaderY + 6, { width: 180, align: 'center' });

				// Filas de alumnos (15 filas en página 1)
				let currentRowY = subHeaderY + 18;
				const rowHeight = 30; // Aumentado aún más para mejor legibilidad

				// Crear 15 filas en la primera página
				for (let i = 0; i < 15; i++) {
					// Dibujar fila
					doc.rect(30, currentRowY, tableWidth, rowHeight)
						.strokeColor(primaryColor)
						.lineWidth(1)
						.stroke();

					// Líneas verticales
					currentX = 30;
					for (let j = 0; j < colWidths.length; j++) {
						currentX += colWidths[j];
						if (j < colWidths.length - 1) {
							doc.moveTo(currentX, currentRowY)
								.lineTo(currentX, currentRowY + rowHeight)
								.strokeColor(primaryColor)
								.lineWidth(1)
								.stroke();
						}
					}

					// Número de fila
					doc.fontSize(9)
						.fillColor(textColor)
						.font('Helvetica')
						.text((i + 1).toString(), 35, currentRowY + 12);

					// Datos del alumno (si existe)
					if (i < alumnosData.length && alumnosData[i]) {
						doc.fontSize(9)
							.fillColor(textColor)
							.font('Helvetica')
							.text(alumnosData[i].apellidos || '', 50, currentRowY + 12, { width: 110 });
						doc.text(alumnosData[i].nombre || '', 170, currentRowY + 12, { width: 110 });
						doc.text(alumnosData[i].documento || '', 290, currentRowY + 12, { width: 110 });
					}
					// Columna de firmas se deja vacía

					currentRowY += rowHeight;
				}

				// Crear página 2
				doc.addPage();

				// Solo cabecera de la tabla en página 2
				const tableY2 = 50;

				// Header principal de la tabla página 2
				doc.rect(30, tableY2, tableWidth, 20)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Línea vertical para separar "DATOS DE LOS ASISTENTES" de "FIRMAS"
				doc.moveTo(30 + 360, tableY2)
					.lineTo(30 + 360, tableY2 + 20)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Header principal
				doc.fontSize(10)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('DATOS DE LOS ASISTENTES', 40, tableY2 + 6, { width: 320, align: 'center' });
				doc.text('FIRMAS', 400, tableY2 + 6, { width: 180, align: 'center' });

				// Subheaders página 2
				const subHeaderY2 = tableY2 + 20;
				doc.rect(30, subHeaderY2, tableWidth, 18)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Líneas verticales para subheaders
				currentX = 30;
				for (let i = 0; i < colWidths.length; i++) {
					currentX += colWidths[i];
					if (i < colWidths.length - 1) {
						doc.moveTo(currentX, subHeaderY2)
							.lineTo(currentX, subHeaderY2 + 18)
							.strokeColor(primaryColor)
							.lineWidth(1)
							.stroke();
					}
				}

				doc.fontSize(9)
					.fillColor(textColor)
					.font('Helvetica-Bold')
					.text('APELLIDOS', 40, subHeaderY2 + 6, { width: 120, align: 'center' });
				doc.text('NOMBRE', 160, subHeaderY2 + 6, { width: 120, align: 'center' });
				doc.text('N.I.F.', 280, subHeaderY2 + 6, { width: 120, align: 'center' });
				doc.text('FIRMAS', 400, subHeaderY2 + 6, { width: 180, align: 'center' });

				// Filas de alumnos página 2 (filas 16-30)
				let currentRowY2 = subHeaderY2 + 18;

				// Crear 15 filas en la segunda página (filas 16-30)
				for (let i = 15; i < 30; i++) {
					// Dibujar fila
					doc.rect(30, currentRowY2, tableWidth, rowHeight)
						.strokeColor(primaryColor)
						.lineWidth(1)
						.stroke();

					// Líneas verticales
					currentX = 30;
					for (let j = 0; j < colWidths.length; j++) {
						currentX += colWidths[j];
						if (j < colWidths.length - 1) {
							doc.moveTo(currentX, currentRowY2)
								.lineTo(currentX, currentRowY2 + rowHeight)
								.strokeColor(primaryColor)
								.lineWidth(1)
								.stroke();
						}
					}

					// Número de fila
					doc.fontSize(9)
						.fillColor(textColor)
						.font('Helvetica')
						.text((i + 1).toString(), 35, currentRowY2 + 12);

					// Datos del alumno (si existe)
					if (i < alumnosData.length && alumnosData[i]) {
						doc.fontSize(9)
							.fillColor(textColor)
							.font('Helvetica')
							.text(alumnosData[i].apellidos || '', 50, currentRowY2 + 12, { width: 110 });
						doc.text(alumnosData[i].nombre || '', 170, currentRowY2 + 12, { width: 110 });
						doc.text(alumnosData[i].documento || '', 290, currentRowY2 + 12, { width: 110 });
					}
					// Columna de firmas se deja vacía

					currentRowY2 += rowHeight;
				}

				// Recuadro de OBSERVACIONES GENERALES
				const observacionesY = currentRowY2 + 20;
				const observacionesHeight = 120; // Aumentado para mejor aprovechamiento del espacio

				doc.rect(30, observacionesY, 555, observacionesHeight)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				doc.fontSize(11)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('OBSERVACIONES GENERALES:', 40, observacionesY + 15);

				doc.end();
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Formatea una fecha para la plantilla (formato __/__/__)
	 * @param {Date|string} date - Fecha a formatear
	 * @returns {string} - Fecha formateada como DD/MM/YYYY o __/__/__ si no hay fecha
	 */
	formatDateForTemplate(date) {
		if (!date) return '__/__/__';

		try {
			const d = new Date(date);
			if (isNaN(d.getTime())) return '__/__/__';

			const day = d.getDate().toString().padStart(2, '0');
			const month = (d.getMonth() + 1).toString().padStart(2, '0');
			const year = d.getFullYear();

			return `${day}/${month}/${year}`;
		} catch (error) {
			console.error('Error formateando fecha:', error);
			return '__/__/__';
		}
	}

	/**
	 * Valida los datos necesarios para generar RECIBÍ DE MATERIAL
	 * @param {Object} grupoData - Datos del grupo
	 * @param {Array} alumnosData - Array de datos de alumnos
	 * @returns {Object} - Resultado de la validación
	 */
	validateRecibiMaterialData(grupoData, alumnosData) {
		const errors = [];

		if (!grupoData || !grupoData.denominacion) {
			errors.push('Denominación de la acción formativa es requerida');
		}

		if (!alumnosData || alumnosData.length === 0) {
			errors.push('Debe haber al menos un alumno en el grupo');
		}

		return {
			isValid: errors.length === 0,
			errors: errors
		};
	}

	/**
	 * Valida los datos necesarios para generar RECIBÍ DE DIPLOMA
	 * @param {Object} grupoData - Datos del grupo
	 * @param {Array} alumnosData - Array de datos de alumnos
	 * @returns {Object} - Resultado de la validación
	 */
	validateRecibiDiplomaData(grupoData, alumnosData) {
		const errors = [];

		if (!grupoData || !grupoData.denominacion) {
			errors.push('Denominación de la acción formativa es requerida');
		}

		if (!alumnosData || alumnosData.length === 0) {
			errors.push('Debe haber al menos un alumno en el grupo');
		}

		return {
			isValid: errors.length === 0,
			errors: errors
		};
	}

	/**
	 * Genera un PDF personalizado con datos del alumno (delantera del diploma)
	 * @param {Object} alumnoData - Datos del alumno
	 * @param {Object} grupoData - Datos del grupo/curso
	 * @returns {Promise<Buffer>} - Buffer del PDF generado
	 */
	async generateDiplomaFront(alumnoData, grupoData) {
		return new Promise((resolve, reject) => {
			try {
				const doc = new PDFDocument({
					size: 'A4',
					layout: 'landscape',
					margins: {
						top: 50,
						bottom: 50,
						left: 50,
						right: 50
					}
				});

				const buffers = [];
				doc.on('data', buffers.push.bind(buffers));
				doc.on('end', () => {
					const pdfBuffer = Buffer.concat(buffers);
					resolve(pdfBuffer);
				});

				// Configurar colores
				const primaryColor = '#1e3a8a'; // Azul oscuro
				const textColor = '#374151'; // Gris oscuro

				// Borde azul (ajustado para landscape: 842x595)
				doc.rect(30, 30, 782, 535)
					.strokeColor(primaryColor)
					.lineWidth(8)
					.stroke();

				// Logo/Header - Cargar imagen del logo
				try {
					const logoPath = path.join(getAssetsPath(), 'praxislogo.png');
					if (fs.existsSync(logoPath)) {
						// Centrar el logo horizontalmente
						const logoWidth = 200;
						const pageWidth = 842; // Ancho de A4 landscape
						const logoX = (pageWidth - logoWidth) / 2;

						doc.image(logoPath, logoX, 60, {
							width: logoWidth
						});
					} else {
						// Fallback al texto si no existe la imagen
						doc.fontSize(24)
							.fillColor(primaryColor)
							.text('praxis', 50, 80, { align: 'center' });

						doc.fontSize(14)
							.fillColor('white')
							.text('centro de formación', 50, 110, {
								align: 'center',
								backgroundColor: primaryColor,
								padding: 5
							});
					}
				} catch (error) {
					console.error('Error cargando logo:', error);
					// Fallback al texto en caso de error
					doc.fontSize(24)
						.fillColor(primaryColor)
						.text('praxis', 50, 80, { align: 'center' });

					doc.fontSize(14)
						.fillColor('white')
						.text('centro de formación', 50, 110, {
							align: 'center',
							backgroundColor: primaryColor,
							padding: 5
						});
				}

				// Lugar y fecha del diploma (si existe) - entre el logo y el nombre del alumno, en azul
				if (grupoData.lugarFechaDiploma) {
					doc.fontSize(14)
						.fillColor(primaryColor)
						.font('Helvetica-Oblique')
						.text(grupoData.lugarFechaDiploma, 50, 150);
				}

				// Información del alumno
				doc.fontSize(16)
					.fillColor(textColor)
					.font('Helvetica-Bold')
					.text(`D./Dña. ${alumnoData.nombre}, con NIF ${alumnoData.documento}`, 50, 190, { align: 'center' });

				// Línea separadora (después de D./Dña.)
				doc.moveTo(30, 215)
					.lineTo(812, 215)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				// Información del curso
				doc.fontSize(14)
					.fillColor(primaryColor)
					.font('Helvetica-Oblique')
					.text('Ha superado en este Centro el CURSO', 50, 230, { align: 'center' });

				doc.fontSize(18)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text(grupoData.denominacion, 50, 250, { align: 'center' });

				doc.fontSize(14)
					.fillColor(primaryColor)
					.font('Helvetica-Oblique')
					.text(`con una duración de ${grupoData.horas} horas en la modalidad ${grupoData.modalidadDiploma ? grupoData.modalidadDiploma : grupoData.modalidad}${grupoData.desgloseHorasDiploma ? ' ' + grupoData.desgloseHorasDiploma : ''}`, 50, 275, { align: 'center' });

				// Sección de firmas (ajustada para landscape)
				const signatureY = 350;
				const startX = 100;
				const spacing = 250;

				// Primero dibujar los textos (quedarán debajo de las firmas)

				// Título "El Director del Centro"
				doc.fontSize(12)
					.fillColor(primaryColor)
					.font('Helvetica-Oblique')
					.text('El Director del Centro', startX, signatureY);

				// Nombre del director
				doc.fontSize(12)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('Roberto Lage Regal', startX, signatureY + 65);

				// El Interesado (solo título, sin firma)
				doc.fontSize(12)
					.fillColor(primaryColor)
					.font('Helvetica-Oblique')
					.text('El Interesado', (842 - 100) / 2, signatureY);

				// Título "El Jefe de Estudios"
				doc.fontSize(12)
					.fillColor(primaryColor)
					.font('Helvetica-Oblique')
					.text('El Jefe de Estudios', startX + spacing * 2, signatureY);

				// Nombre de Sandra Novelle
				doc.fontSize(12)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('Sandra Novelle Rodríguez', startX + spacing * 2, signatureY + 65);

				// Ahora dibujar las firmas ENCIMA de los textos (se renderizan después, así que quedan superpuestas)

				// Firma del director (superpuesta sobre el título)
				try {
					const robertoSignaturePath = path.join(getAssetsPath(), 'RobertoLage.png');
					if (fs.existsSync(robertoSignaturePath)) {
						doc.image(robertoSignaturePath, startX - 30, signatureY - 20, {
							width: 180,
						});
					}
				} catch (error) {
					console.warn('Error cargando firma de Roberto Lage:', error);
				}

				// Firma de Sandra Novelle (superpuesta sobre el título)
				try {
					const sandraSignaturePath = path.join(getAssetsPath(), 'SandraNovelle.png');
					if (fs.existsSync(sandraSignaturePath)) {
						doc.image(sandraSignaturePath, (startX - 30) + spacing * 2, signatureY - 20, {
							width: 180,
						});
					}
				} catch (error) {
					console.warn('Error cargando firma de Sandra Novelle:', error);
				}


				const centerInfoX = (842 - 350) / 2;
				const centerInfoY = 450;
				const centerInfoWidth = 350;
				const centerInfoPadding = 10;

				// Calcular altura dinámica del texto
				const centroText = grupoData.centro || 'NOMBRE DEL CENTRO DE FORMACIÓN';
				const direccionText = grupoData.direccion || 'DIRECCIÓN CENTRO DE FORMACIÓN';

				doc.font('Helvetica-Bold').fontSize(16);
				const centroHeight = doc.heightOfString(centroText, { width: centerInfoWidth - (centerInfoPadding * 2) });

				doc.font('Helvetica').fontSize(12);
				const direccionHeight = doc.heightOfString(direccionText, { width: centerInfoWidth - (centerInfoPadding * 2) });

				// Altura total del rectángulo = padding superior + altura centro + espacio + altura dirección + padding inferior
				const centerInfoHeight = centerInfoPadding + centroHeight + 5 + direccionHeight + centerInfoPadding;

				doc.rect(centerInfoX, centerInfoY, centerInfoWidth, centerInfoHeight)
					.strokeColor(primaryColor)
					.lineWidth(1)
					.stroke();

				doc.fontSize(16)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text(centroText, centerInfoX + centerInfoPadding, centerInfoY + centerInfoPadding, { width: centerInfoWidth - (centerInfoPadding * 2), align: 'center' });

				doc.fontSize(12)
					.fillColor(primaryColor)
					.font('Helvetica')
					.text(direccionText, centerInfoX + centerInfoPadding, centerInfoY + centerInfoPadding + centroHeight + 5, { width: centerInfoWidth - (centerInfoPadding * 2), align: 'center' });

				// Número de homologación de seguridad (si existe)
				if (grupoData.numHomologacionSeguridad) {
					doc.fontSize(10)
						.fillColor(primaryColor)
						.font('Helvetica-Oblique')
						.text(`Número de Inscripción: ${grupoData.numHomologacionSeguridad}`, centerInfoX, centerInfoY + centerInfoHeight + 8, { width: centerInfoWidth, align: 'center' });
				}

				doc.end();
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Combina dos PDFs (delantera + trasera)
	 * @param {Buffer} frontPdf - PDF de la delantera
	 * @param {Buffer} backPdf - PDF de la trasera
	 * @returns {Promise<Buffer>} - PDF combinado
	 */
	async combinePDFs(frontPdf, backPdf) {
		try {
			// Crear un nuevo documento PDF
			const combinedPdf = await PDFLib.create();

			// Cargar el PDF de la delantera
			const frontPdfDoc = await PDFLib.load(frontPdf);
			const frontPages = await combinedPdf.copyPages(frontPdfDoc, frontPdfDoc.getPageIndices());
			frontPages.forEach((page) => combinedPdf.addPage(page));

			// Cargar el PDF de la trasera
			const backPdfDoc = await PDFLib.load(backPdf);
			const backPages = await combinedPdf.copyPages(backPdfDoc, backPdfDoc.getPageIndices());
			backPages.forEach((page) => combinedPdf.addPage(page));

			// Generar el PDF combinado
			const pdfBytes = await combinedPdf.save();
			return Buffer.from(pdfBytes);
		} catch (error) {
			console.error('Error al combinar PDFs:', error);
			throw error;
		}
	}

	/**
	 * Genera un diploma completo (delantera + trasera)
	 * @param {Object} alumnoData - Datos del alumno
	 * @param {Object} grupoData - Datos del grupo
	 * @param {Buffer} traseraPdf - PDF de la trasera
	 * @returns {Promise<Buffer>} - PDF del diploma completo
	 */
	async generateCompleteDiploma(alumnoData, grupoData, traseraPdf) {
		try {
			// Generar la delantera personalizada
			const frontPdf = await this.generateDiplomaFront(alumnoData, grupoData);

			// Combinar con la trasera
			const completeDiploma = await this.combinePDFs(frontPdf, traseraPdf);

			return completeDiploma;
		} catch (error) {
			console.error('Error al generar diploma completo:', error);
			throw error;
		}
	}

	/**
	 * Valida los datos necesarios para generar un diploma
	 * @param {Object} alumnoData - Datos del alumno
	 * @param {Object} grupoData - Datos del grupo
	 * @returns {Object} - Resultado de la validación
	 */
	validateDiplomaData(alumnoData, grupoData) {
		const errors = [];

		if (!alumnoData || !alumnoData.nombre) {
			errors.push('Nombre del alumno es requerido');
		}

		if (!alumnoData || !alumnoData.documento) {
			errors.push('Documento del alumno es requerido');
		}

		if (!grupoData || !grupoData.denominacion) {
			errors.push('Denominación del curso es requerida');
		}

		if (!grupoData || !grupoData.horas || grupoData.horas <= 0) {
			errors.push('Las horas del curso deben ser mayores a 0');
		}

		return {
			isValid: errors.length === 0,
			errors: errors
		};
	}

	/**
	 * Genera el PDF de CONTROL DE ASISTENCIA basado en la plantilla
	 * @param {Object} grupoData - Datos del grupo
	 * @param {Array} alumnosData - Array de datos de alumnos
	 * @param {Object} sesionData - Datos de la sesión (opcional)
	 * @returns {Promise<Buffer>} - Buffer del PDF generado
	 */
	async generateControlAsistencia(grupoData, alumnosData, sesionData = null) {
		return new Promise((resolve, reject) => {
			try {
				const doc = new PDFDocument({
					size: 'A4',
					layout: 'portrait',
					margins: {
						top: 20,
						bottom: 20,
						left: 20,
						right: 20
					}
				});

				const buffers = [];
				doc.on('data', buffers.push.bind(buffers));
				doc.on('end', () => {
					const pdfBuffer = Buffer.concat(buffers);
					resolve(pdfBuffer);
				});

				// Configurar colores
				const primaryColor = '#1e3a8a'; // Azul oscuro
				const textColor = '#374151'; // Gris oscuro
				const grayColor = '#9ca3af'; // Gris claro para líneas

				// Logo/Header - Cargar imagen del logo FUNDAE
				try {
					const logoPath = path.join(getAssetsPath(), 'fundae_logo.png');
					if (fs.existsSync(logoPath)) {
						doc.image(logoPath, 30, 30, {
							width: 60
						});
					} else {
						// Fallback al texto si no existe la imagen
						doc.fontSize(16)
							.fillColor(primaryColor)
							.text('FUNDAE', 30, 40);

						doc.fontSize(9)
							.fillColor('white')
							.text('centro de formación', 30, 55, {
								backgroundColor: primaryColor,
								padding: 2
							});
					}
				} catch (error) {
					console.error('Error cargando logo:', error);
					// Fallback al texto en caso de error
					doc.fontSize(16)
						.fillColor(primaryColor)
						.text('FUNDAE', 30, 40);

					doc.fontSize(9)
						.fillColor('white')
						.text('centro de formación', 30, 55, {
							backgroundColor: primaryColor,
							padding: 2
						});
				}

				// Título principal
				doc.fontSize(16)
					.fillColor(primaryColor)
					.font('Helvetica')
					.text('CONTROL DE ASISTENCIA', 30, 100, { align: 'center' });

				// Sección OPCIÓN C - Entidad Organizadora
				const opcionCY = 130;
				doc.rect(30, opcionCY, 545, 45)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				// Columna 1: OPCIÓN C
				doc.fontSize(10)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('OPCIÓN C', 40, opcionCY + 18);

				// Columna 2: ENTIDAD ORGANIZADORA y EXPEDIENTE (una debajo de otra)
				doc.fontSize(9)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('ENTIDAD ORGANIZADORA:', 110, opcionCY + 10)
					.font('Helvetica')
					.text(grupoData.entidadOrganizadora || '', 230, opcionCY + 10);

				doc.font('Helvetica-Bold')
					.text('EXPEDIENTE:', 110, opcionCY + 26)
					.font('Helvetica')
					.text(grupoData.expediente || '', 175, opcionCY + 26);

				// Columna 3: CIF (alineado con ENTIDAD ORGANIZADORA)
				doc.font('Helvetica-Bold')
					.text('CIF.:', 480, opcionCY + 10)
					.font('Helvetica')
					.text(grupoData.cif || '', 505, opcionCY + 10);

				// Nota explicativa
				doc.fontSize(7)
					.fillColor('#6b7280')
					.font('Helvetica-Oblique')
					.text('(Se seleccionará uno de los apartados anteriores dependiendo del perfil con el que se haya accedido al Sistema telemático de Formación Programada por las Empresas)', 40, opcionCY + 50, { width: 540 });

				// Sección de datos de la acción formativa
				const accionY = opcionCY + 70;
				doc.rect(30, accionY, 545, 100)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				// Línea 1: Denominación de la acción formativa
				doc.fontSize(9)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('DENOMINACIÓN DE LA ACCIÓN FORMATIVA:', 40, accionY + 10)
					.font('Helvetica')
					.text(grupoData.denominacion || '', 240, accionY + 10, { width: 320 });

				// Línea 2: Nº, Grupo, Fecha de inicio y Fecha de fin
				doc.font('Helvetica-Bold')
					.text('Nº:', 40, accionY + 26)
					.font('Helvetica')
					.text(grupoData.numero || '', 55, accionY + 26);

				doc.font('Helvetica-Bold')
					.text('GRUPO:', 120, accionY + 26)
					.font('Helvetica')
					.text(grupoData.grupo || '', 160, accionY + 26);

				doc.font('Helvetica-Bold')
					.text('FECHA DE INICIO:', 250, accionY + 26)
					.font('Helvetica')
					.text(this.formatDateForTemplate(grupoData.fechaInicio), 345, accionY + 26);

				doc.font('Helvetica-Bold')
					.text('FECHA FIN:', 430, accionY + 26)
					.font('Helvetica')
					.text(this.formatDateForTemplate(grupoData.fechaFin), 490, accionY + 26);

				// Línea 3: Formador/Responsable
				doc.font('Helvetica-Bold')
					.text('FORMADOR/RESPONSABLE DE FORMACIÓN:', 40, accionY + 42)
					.font('Helvetica')
					.text(sesionData?.docente || '', 250, accionY + 42);

				// Línea 4: Sesión, Fecha, Mañana/Tarde y Horario
				doc.font('Helvetica-Bold')
					.text('SESIÓN N°:', 40, accionY + 58)
					.font('Helvetica')
					.text(sesionData?.numeroSesion || '', 95, accionY + 58);

				doc.font('Helvetica-Bold')
					.text('FECHA:', 125, accionY + 58)
					.font('Helvetica')
					.text(sesionData?.fecha || '__/__/__', 160, accionY + 58);

				// Determinar mañana/tarde
				const turno = sesionData?.esManana !== undefined
					? (sesionData.esManana ? 'MAÑANA' : 'TARDE')
					: '';

				doc.font('Helvetica-Bold')
					.text('MAÑANA/TARDE:', 230, accionY + 58)
					.font('Helvetica')
					.text(turno, 320, accionY + 58);

				doc.font('Helvetica-Bold')
					.text('HORARIO DE:', 390, accionY + 58)
					.font('Helvetica')
					.text(sesionData?.horarioInicio || '__:__', 455, accionY + 58)
					.font('Helvetica-Bold')
					.text('A:', 495, accionY + 58)
					.font('Helvetica')
					.text(sesionData?.horarioFin || '__:__', 510, accionY + 58);

				// Línea 5: Firmado
				doc.font('Helvetica-Bold')
					.text('Firmado:', 40, accionY + 74)
					.font('Helvetica')
					.text('', 90, accionY + 74);

				doc.fontSize(8)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('(Formador/Resp. Formación)', 40, accionY + 85);

				// Tabla de participantes (copiada de Recibí de Material con columnas adicionales)
				const tableY = accionY + 120;
				const tableWidth = 545;
				const colNumWidth = 30;
				const colApellidosWidth = 105;
				const colNombreWidth = 105;
				const colNifWidth = 80;
				const colFirmasWidth = 115;
				const colObservacionesWidth = 110;
				const colWidths = [colNumWidth, colApellidosWidth, colNombreWidth, colNifWidth, colFirmasWidth, colObservacionesWidth];
				const datosWidth = colNumWidth + colApellidosWidth + colNombreWidth + colNifWidth;

				// Header principal de la tabla
				doc.rect(30, tableY, tableWidth, 20)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				// Línea vertical para separar "DATOS DE LOS ASISTENTES" de "FIRMAS"
				doc.moveTo(30 + datosWidth, tableY)
					.lineTo(30 + datosWidth, tableY + 20)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				// Línea vertical para separar "FIRMAS" de "OBSERVACIONES"
				doc.moveTo(30 + datosWidth + colFirmasWidth, tableY)
					.lineTo(30 + datosWidth + colFirmasWidth, tableY + 20)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				// Header principal
				doc.fontSize(10)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('DATOS DE LOS ASISTENTES', 40, tableY + 6, { width: datosWidth - 20, align: 'center' });
				doc.text('FIRMAS', 30 + datosWidth + 5, tableY + 6, { width: colFirmasWidth - 10, align: 'center' });
				doc.text('OBSERVACIONES', 30 + datosWidth + colFirmasWidth + 5, tableY + 6, { width: colObservacionesWidth - 10, align: 'center' });

				// Subheaders
				const subHeaderY = tableY + 20;
				doc.rect(30, subHeaderY, tableWidth, 18)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				// Líneas verticales para subheaders
				let currentX = 30;
				for (let i = 0; i < colWidths.length; i++) {
					currentX += colWidths[i];
					if (i < colWidths.length - 1) {
						doc.moveTo(currentX, subHeaderY)
							.lineTo(currentX, subHeaderY + 18)
							.strokeColor(grayColor)
							.lineWidth(1)
							.stroke();
					}
				}

				doc.fontSize(9)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('APELLIDOS', 30 + colNumWidth + 5, subHeaderY + 6, { width: colApellidosWidth - 10, align: 'center' });
				doc.text('NOMBRE', 30 + colNumWidth + colApellidosWidth + 5, subHeaderY + 6, { width: colNombreWidth - 10, align: 'center' });
				doc.text('N.I.F.', 30 + colNumWidth + colApellidosWidth + colNombreWidth + 5, subHeaderY + 6, { width: colNifWidth - 10, align: 'center' });

				// Filas de alumnos (12 filas en página 1)
				let currentRowY = subHeaderY + 18;
				const rowHeight = 30;

				// Crear 12 filas en la primera página
				for (let i = 0; i < 12; i++) {
					// Dibujar fila
					doc.rect(30, currentRowY, tableWidth, rowHeight)
						.strokeColor(grayColor)
						.lineWidth(1)
						.stroke();

					// Líneas verticales
					currentX = 30;
					for (let j = 0; j < colWidths.length; j++) {
						currentX += colWidths[j];
						if (j < colWidths.length - 1) {
							doc.moveTo(currentX, currentRowY)
								.lineTo(currentX, currentRowY + rowHeight)
								.strokeColor(grayColor)
								.lineWidth(1)
								.stroke();
						}
					}

					// Número de fila
					doc.fontSize(9)
						.fillColor(textColor)
						.font('Helvetica')
						.text((i + 1).toString(), 35, currentRowY + 12, { width: colNumWidth - 10, align: 'center' });

					// Datos del alumno (si existe)
					if (i < alumnosData.length && alumnosData[i]) {
						doc.fontSize(9)
							.fillColor(textColor)
							.font('Helvetica')
							.text(alumnosData[i].apellidos || '', 30 + colNumWidth + 5, currentRowY + 12, { width: colApellidosWidth - 10 });
						doc.text(alumnosData[i].nombre || '', 30 + colNumWidth + colApellidosWidth + 5, currentRowY + 12, { width: colNombreWidth - 10 });
						doc.text(alumnosData[i].documento || '', 30 + colNumWidth + colApellidosWidth + colNombreWidth + 5, currentRowY + 12, { width: colNifWidth - 10 });
					}
					// Columnas de firmas y observaciones se dejan vacías

					currentRowY += rowHeight;
				}

				// Recuadro de OBSERVACIONES GENERALES página 1
				const observacionesY1 = currentRowY + 10;
				const observacionesHeight1 = 60;

				doc.rect(30, observacionesY1, 545, observacionesHeight1)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				doc.fontSize(11)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('OBSERVACIONES GENERALES:', 40, observacionesY1 + 10);

				// Footer página 1
				doc.fontSize(9)
					.fillColor(primaryColor)
					.font('Helvetica')
					.text('Hoja 1 de 2', 30, 810, { width: 545, align: 'right' });

				// Crear página 2
				doc.addPage();

				// Solo cabecera de la tabla en página 2
				const tableY2 = 50;

				// Header principal de la tabla página 2
				doc.rect(30, tableY2, tableWidth, 20)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				// Línea vertical para separar "DATOS DE LOS ASISTENTES" de "FIRMAS"
				doc.moveTo(30 + datosWidth, tableY2)
					.lineTo(30 + datosWidth, tableY2 + 20)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				// Línea vertical para separar "FIRMAS" de "OBSERVACIONES"
				doc.moveTo(30 + datosWidth + colFirmasWidth, tableY2)
					.lineTo(30 + datosWidth + colFirmasWidth, tableY2 + 20)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				// Header principal
				doc.fontSize(10)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('DATOS DE LOS ASISTENTES', 40, tableY2 + 6, { width: datosWidth - 20, align: 'center' });
				doc.text('FIRMAS', 30 + datosWidth + 5, tableY2 + 6, { width: colFirmasWidth - 10, align: 'center' });
				doc.text('OBSERVACIONES', 30 + datosWidth + colFirmasWidth + 5, tableY2 + 6, { width: colObservacionesWidth - 10, align: 'center' });

				// Subheaders página 2
				const subHeaderY2 = tableY2 + 20;
				doc.rect(30, subHeaderY2, tableWidth, 18)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				// Líneas verticales para subheaders
				currentX = 30;
				for (let i = 0; i < colWidths.length; i++) {
					currentX += colWidths[i];
					if (i < colWidths.length - 1) {
						doc.moveTo(currentX, subHeaderY2)
							.lineTo(currentX, subHeaderY2 + 18)
							.strokeColor(grayColor)
							.lineWidth(1)
							.stroke();
					}
				}

				doc.fontSize(9)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('APELLIDOS', 30 + colNumWidth + 5, subHeaderY2 + 6, { width: colApellidosWidth - 10, align: 'center' });
				doc.text('NOMBRE', 30 + colNumWidth + colApellidosWidth + 5, subHeaderY2 + 6, { width: colNombreWidth - 10, align: 'center' });
				doc.text('N.I.F.', 30 + colNumWidth + colApellidosWidth + colNombreWidth + 5, subHeaderY2 + 6, { width: colNifWidth - 10, align: 'center' });

				// Filas de alumnos página 2 (filas 13-30)
				let currentRowY2 = subHeaderY2 + 18;

				// Crear 18 filas en la segunda página (filas 13-30)
				for (let i = 12; i < 30; i++) {
					// Dibujar fila
					doc.rect(30, currentRowY2, tableWidth, rowHeight)
						.strokeColor(grayColor)
						.lineWidth(1)
						.stroke();

					// Líneas verticales
					currentX = 30;
					for (let j = 0; j < colWidths.length; j++) {
						currentX += colWidths[j];
						if (j < colWidths.length - 1) {
							doc.moveTo(currentX, currentRowY2)
								.lineTo(currentX, currentRowY2 + rowHeight)
								.strokeColor(grayColor)
								.lineWidth(1)
								.stroke();
						}
					}

					// Número de fila
					doc.fontSize(9)
						.fillColor(textColor)
						.font('Helvetica')
						.text((i + 1).toString(), 35, currentRowY2 + 12, { width: colNumWidth - 10, align: 'center' });

					// Datos del alumno (si existe)
					if (i < alumnosData.length && alumnosData[i]) {
						doc.fontSize(9)
							.fillColor(textColor)
							.font('Helvetica')
							.text(alumnosData[i].apellidos || '', 30 + colNumWidth + 5, currentRowY2 + 12, { width: colApellidosWidth - 10 });
						doc.text(alumnosData[i].nombre || '', 30 + colNumWidth + colApellidosWidth + 5, currentRowY2 + 12, { width: colNombreWidth - 10 });
						doc.text(alumnosData[i].documento || '', 30 + colNumWidth + colApellidosWidth + colNombreWidth + 5, currentRowY2 + 12, { width: colNifWidth - 10 });
					}
					// Columnas de firmas y observaciones se dejan vacías

					currentRowY2 += rowHeight;
				}

				// Recuadro de OBSERVACIONES GENERALES
				const observacionesY = currentRowY2 + 20;
				const observacionesHeight = 120;

				doc.rect(30, observacionesY, 545, observacionesHeight)
					.strokeColor(grayColor)
					.lineWidth(1)
					.stroke();

				doc.fontSize(11)
					.fillColor(primaryColor)
					.font('Helvetica-Bold')
					.text('OBSERVACIONES GENERALES:', 40, observacionesY + 15);

				// Footer página 2
				doc.fontSize(9)
					.fillColor(primaryColor)
					.font('Helvetica')
					.text('Hoja 2 de 2', 30, 810, { width: 545, align: 'right' });

				doc.end();

			} catch (error) {
				console.error('Error generando CONTROL DE ASISTENCIA:', error);
				reject(error);
			}
		});
	}
}

module.exports = new PDFService();
