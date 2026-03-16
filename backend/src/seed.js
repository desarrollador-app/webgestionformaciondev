const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Limpiar datos existentes (en orden inverso por las relaciones)
    console.log('🧹 Limpiando datos existentes...');
    await prisma.documentacionAdjAlumnoGrupo.deleteMany();
    await prisma.documentacionAdjDocenteGrupo.deleteMany();
    await prisma.documentacionAdjEmpresa.deleteMany();
    await prisma.alumnosPersonaGrupo.deleteMany();
    await prisma.docentesPersonaGrupo.deleteMany();
    await prisma.grupos.deleteMany();
    await prisma.accionesFormativas.deleteMany();
    await prisma.desgloseAreasProfesionales.deleteMany();
    await prisma.areaProfesional.deleteMany();
    await prisma.centrosTrabajo.deleteMany();
    await prisma.empresas.deleteMany();
    await prisma.personas.deleteMany();
    await prisma.planes.deleteMany();
    await prisma.tareas.deleteMany();

    // 1. Crear Áreas Profesionales
    console.log('Creando áreas profesionales...');
    const area1 = await prisma.areaProfesional.create({
      data: {
        abreviatura: 'TIC',
        nombre: 'Tecnologías de la Información y Comunicación'
      }
    });

    const area2 = await prisma.areaProfesional.create({
      data: {
        abreviatura: 'ADM',
        nombre: 'Administración y Gestión'
      }
    });

    const area3 = await prisma.areaProfesional.create({
      data: {
        abreviatura: 'COM',
        nombre: 'Comercio y Marketing'
      }
    });

    // 2. Crear Desglose de Áreas Profesionales
    console.log('Creando desglose de áreas profesionales...');
    const desglose1 = await prisma.desgloseAreasProfesionales.create({
      data: {
        id_area: area1.id_area,
        codigo_grupo: 'TIC001',
        desglose: 'Desarrollo de Aplicaciones Web'
      }
    });

    const desglose2 = await prisma.desgloseAreasProfesionales.create({
      data: {
        id_area: area1.id_area,
        codigo_grupo: 'TIC002',
        desglose: 'Administración de Sistemas Informáticos'
      }
    });

    const desglose3 = await prisma.desgloseAreasProfesionales.create({
      data: {
        id_area: area2.id_area,
        codigo_grupo: 'ADM001',
        desglose: 'Gestión Administrativa'
      }
    });

    // 3. Crear Planes
    console.log('Creando planes...');
    const plan1 = await prisma.planes.create({
      data: {
        expediente: 'EXP-2024-001',
        estado: 'Concedido',
        nombre: 'Plan de Formación Digital 2024',
        solicitante: 'Junta de Andalucía',
        fecha_convocatoria_plan: 2024,
        responsable: 'María García López',
        fecha_inicio: new Date('2024-01-15'),
        fecha_fin: new Date('2024-12-31'),
        tipo_bonificacion: 'Fundae'
      }
    });

    const plan2 = await prisma.planes.create({
      data: {
        expediente: 'EXP-2024-002',
        estado: 'Solicitado',
        nombre: 'Plan de Competencias Digitales',
        solicitante: 'Ministerio de Educación',
        fecha_convocatoria_plan: 2024,
        responsable: 'Carlos Ruiz Martín',
        fecha_inicio: new Date('2024-03-01'),
        fecha_fin: new Date('2024-11-30'),
        tipo_bonificacion: 'Fundae'
      }
    });

    // 4. Crear Acciones Formativas
    console.log('Creando acciones formativas...');
    const accion1 = await prisma.accionesFormativas.create({
      data: {
        denominacion: 'Desarrollo Web con React y Node.js',
        numero_accion: 'AF-001-2024',
        modalidad: 'Mixta',
        id_area: area1.id_area,
        id_desglose: desglose1.id_desglose,
        codigo_grupo_accion: 'GRP-001',
        horas_modalidad_presencial: 40,
        horas_modalidad_teleformacion: 60,
        cif_plataforma: 'B12345678',
        razon_social_plataforma: 'Plataforma Virtual S.L.',
        uri: 'https://plataforma.ejemplo.com',
        usuario: 'admin',
        password: 'password123',
        observaciones: 'Curso de desarrollo web moderno',
        nivel_formacion: 'SUPERIOR',
        objetivos: 'Formar desarrolladores web full-stack',
        contenido: 'HTML, CSS, JavaScript, React, Node.js, MongoDB',
        id_plan: plan1.id_plan
      }
    });

    const accion2 = await prisma.accionesFormativas.create({
      data: {
        denominacion: 'Administración de Sistemas Linux',
        numero_accion: 'AF-002-2024',
        modalidad: 'Presencial',
        id_area: area1.id_area,
        id_desglose: desglose2.id_desglose,
        codigo_grupo_accion: 'GRP-002',
        horas_modalidad_presencial: 80,
        horas_modalidad_teleformacion: 0,
        observaciones: 'Curso de administración de servidores Linux',
        nivel_formacion: 'SUPERIOR',
        objetivos: 'Formar administradores de sistemas Linux',
        contenido: 'Linux, Bash, Docker, Kubernetes, Ansible',
        id_plan: plan1.id_plan
      }
    });

    const accion3 = await prisma.accionesFormativas.create({
      data: {
        denominacion: 'Gestión Administrativa Empresarial',
        numero_accion: 'AF-003-2024',
        modalidad: 'Teleformacion',
        id_area: area2.id_area,
        id_desglose: desglose3.id_desglose,
        codigo_grupo_accion: 'GRP-003',
        horas_modalidad_presencial: 0,
        horas_modalidad_teleformacion: 100,
        observaciones: 'Curso de gestión administrativa',
        nivel_formacion: 'BASICO',
        objetivos: 'Formar gestores administrativos',
        contenido: 'Contabilidad, Fiscalidad, Recursos Humanos',
        id_plan: plan2.id_plan
      }
    });

    // 5. Crear Empresas
    console.log('Creando empresas...');
    const empresa1 = await prisma.empresas.create({
      data: {
        razon_social: 'Tecnología Avanzada S.L.',
        CIF: 'B12345678',
        NSS: '1234567890',
        direccion: 'Calle Tecnología, 123, 28001 Madrid',
        persona_contacto: 'Ana Martínez',
        telefono1: '911234567',
        telefono2: '912345678',
        fax: '913456789',
        sector_actividad: 'Tecnología e Informática',
        CNAE: '6201',
        CNAE2009: '6201',
        correo_electronico: 'info@tecnologia-avanzada.com',
        pagina_web: 'https://www.tecnologia-avanzada.com',
        nombre_representante: 'Juan Pérez',
        NIF_representante: '12345678A',
        informa_RLT: 'Sí',
        valor_informe: 'B',
        fecha_discrepancia: null,
        resuelto: true,
        comentarios: 'Empresa líder en desarrollo de software'
      }
    });

    const empresa2 = await prisma.empresas.create({
      data: {
        razon_social: 'Servicios Administrativos del Sur S.A.',
        CIF: 'A87654321',
        NSS: '0987654321',
        direccion: 'Avenida Andalucía, 456, 41001 Sevilla',
        persona_contacto: 'Carmen López',
        telefono1: '954123456',
        sector_actividad: 'Servicios Administrativos',
        CNAE: '8211',
        CNAE2009: '8211',
        correo_electronico: 'contacto@servicios-sur.com',
        pagina_web: 'https://www.servicios-sur.com',
        nombre_representante: 'María González',
        NIF_representante: '87654321B',
        informa_RLT: 'Sí',
        valor_informe: 'B',
        fecha_discrepancia: null,
        resuelto: true,
        comentarios: 'Especialistas en gestión administrativa'
      }
    });

    // 6. Crear Centros de Trabajo
    console.log('Creando centros de trabajo...');
    const centro1 = await prisma.centrosTrabajo.create({
      data: {
        nombre: 'Sede Central Madrid',
        NSS: '1234567890',
        direccion: 'Calle Tecnología, 123, 28001 Madrid',
        persona_contacto: 'Ana Martínez',
        telefono1: '911234567',
        correo_electronico: 'madrid@tecnologia-avanzada.com',
        cuenta_bancaria: 'ES1234567890123456789012',
        IBAN: 'ES1234567890123456789012',
        BIC: 'CAIXESBBXXX',
        id_empresa: empresa1.id_empresa
      }
    });

    const centro2 = await prisma.centrosTrabajo.create({
      data: {
        nombre: 'Oficina Sevilla',
        NSS: '0987654321',
        direccion: 'Avenida Andalucía, 456, 41001 Sevilla',
        persona_contacto: 'Carmen López',
        telefono1: '954123456',
        correo_electronico: 'sevilla@servicios-sur.com',
        cuenta_bancaria: 'ES9876543210987654321098',
        IBAN: 'ES9876543210987654321098',
        BIC: 'BBVAESMMXXX',
        id_empresa: empresa2.id_empresa
      }
    });

    // 7. Crear Personas
    console.log('Creando personas...');
    const persona1 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '12345678A',
        nombre: 'Juan',
        apellido1: 'Pérez',
        apellido2: 'García',
        telefono: '611234567',
        correoElectronico: 'juan.perez@email.com',
        NSS: '1234567890123',
        es_docente: true,
        es_alumno: false,
        fecha_nacimiento: new Date('1985-03-15'),
        sexo: 'Hombre',
        domicilio: 'Calle Mayor, 10, 28001 Madrid',
        comentarios: 'Experto en desarrollo web'
      }
    });

    const persona2 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '87654321B',
        nombre: 'María',
        apellido1: 'González',
        apellido2: 'López',
        telefono: '612345678',
        correoElectronico: 'maria.gonzalez@email.com',
        NSS: '2345678901234',
        es_docente: true,
        es_alumno: false,
        fecha_nacimiento: new Date('1980-07-22'),
        sexo: 'Mujer',
        domicilio: 'Avenida de la Paz, 25, 41001 Sevilla',
        comentarios: 'Especialista en administración de sistemas'
      }
    });

    const persona3 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '11223344C',
        nombre: 'Carlos',
        apellido1: 'Ruiz',
        apellido2: 'Martín',
        telefono: '613456789',
        correoElectronico: 'carlos.ruiz@email.com',
        NSS: '3456789012345',
        es_docente: false,
        es_alumno: true,
        fecha_nacimiento: new Date('1995-11-08'),
        sexo: 'Hombre',
        domicilio: 'Plaza España, 5, 28001 Madrid',
        comentarios: 'Estudiante de desarrollo web'
      }
    });

    const persona4 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '55667788D',
        nombre: 'Laura',
        apellido1: 'Sánchez',
        apellido2: 'Fernández',
        telefono: '614567890',
        correoElectronico: 'laura.sanchez@email.com',
        NSS: '4567890123456',
        es_docente: false,
        es_alumno: true,
        fecha_nacimiento: new Date('1998-04-12'),
        sexo: 'Mujer',
        domicilio: 'Calle Nueva, 15, 41001 Sevilla',
        comentarios: 'Estudiante de administración'
      }
    });

    // 8. Crear Grupos
    console.log('Creando grupos...');
    const grupo1 = await prisma.grupos.create({
      data: {
        estado: 'En_Ejecucion',
        codigo: 'GRP-001-2024',
        fecha_inicio: new Date('2024-02-01'),
        fecha_fin: new Date('2024-06-30'),
        denominacion: 'Grupo Desarrollo Web - Madrid',
        responsable: 'Juan Pérez',
        telefono_responsable: '611234567',
        observaciones: 'Grupo de desarrollo web en modalidad mixta',
        centro_cif: 'B12345678',
        centro_nombre: 'Sede Central Madrid',
        centro_direccion: 'Calle Tecnología, 123, 28001 Madrid',
        centro_codPostal: '28001',
        centro_localidad: 'Madrid',
        lugar_imparticion_nombre: 'Aula de Informática 1',
        lugar_imparticion_direccion: 'Calle Tecnología, 123, 28001 Madrid',
        lugar_imparticion_codPostal: '28001',
        lugar_imparticion_localidad: 'Madrid',
        horas_totales_presencial_horario: 40,
        hora_inicio_tramo1_presencial_horario: new Date('1970-01-01T09:00:00.000Z'),
        hora_fin_tramo1_presencial_horario: new Date('1970-01-01T13:00:00.000Z'),
        dias_presencial_horario: 'Lunes, Miércoles, Viernes',
        fecha_imparticion_presencial_calendario: new Date('2024-02-01'),
        horario_inicio_tramo1_presencial_calendario: new Date('1970-01-01T09:00:00.000Z'),
        horario_fin_tramo1_presencial_calendario: new Date('1970-01-01T13:00:00.000Z'),
        aula_virtual: true,
        medio_aula_virtual: 'Moodle',
        conexion_aula_virtual: 'https://aula.tecnologia-avanzada.com',
        contacto_aula_virtual: 'Ana Martínez',
        telefono_aula_virtual: '911234567',
        bimodal_aula_virtual: 'sin_participantes_en_centro',
        tele_centro_cif: 'B12345678',
        tele_centro_nombre: 'Sede Central Madrid',
        tele_centro_direccion: 'Calle Tecnología, 123, 28001 Madrid',
        tele_centro_codPostal: '28001',
        tele_centro_localidad: 'Madrid',
        tele_telefono: '911234567',
        horas_totales_teleformacion: 60,
        hora_inicio_tramo1_tele: new Date('1970-01-01T16:00:00.000Z'),
        hora_fin_tramo1_tele: new Date('1970-01-01T20:00:00.000Z'),
        dias_tele: 'Martes, Jueves',
        id_accion: accion1.id_accion
      }
    });

    const grupo2 = await prisma.grupos.create({
      data: {
        estado: 'Ejecutado',
        codigo: 'GRP-002-2024',
        fecha_inicio: new Date('2024-01-15'),
        fecha_fin: new Date('2024-05-15'),
        denominacion: 'Grupo Administración Linux - Sevilla',
        responsable: 'María González',
        telefono_responsable: '612345678',
        observaciones: 'Grupo de administración de sistemas Linux',
        centro_cif: 'A87654321',
        centro_nombre: 'Oficina Sevilla',
        centro_direccion: 'Avenida Andalucía, 456, 41001 Sevilla',
        centro_codPostal: '41001',
        centro_localidad: 'Sevilla',
        lugar_imparticion_nombre: 'Laboratorio de Sistemas',
        lugar_imparticion_direccion: 'Avenida Andalucía, 456, 41001 Sevilla',
        lugar_imparticion_codPostal: '41001',
        lugar_imparticion_localidad: 'Sevilla',
        horas_totales_presencial_horario: 80,
        hora_inicio_tramo1_presencial_horario: new Date('1970-01-01T09:00:00.000Z'),
        hora_fin_tramo1_presencial_horario: new Date('1970-01-01T14:00:00.000Z'),
        dias_presencial_horario: 'Lunes a Viernes',
        fecha_imparticion_presencial_calendario: new Date('2024-01-15'),
        horario_inicio_tramo1_presencial_calendario: new Date('1970-01-01T09:00:00.000Z'),
        horario_fin_tramo1_presencial_calendario: new Date('1970-01-01T14:00:00.000Z'),
        aula_virtual: false,
        id_accion: accion2.id_accion
      }
    });

    // 9. Crear Alumnos en Grupos
    console.log('Creando alumnos en grupos...');
    await prisma.alumnosPersonaGrupo.create({
      data: {
        id_persona: persona3.id_persona,
        id_grupo: grupo1.id_grupo,
        id_centro: centro1.id_centro,
        fecha_inscripcion: new Date('2024-01-20'),
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 3,
        estado_curso: 'Finalizado',
        progreso_curso: 'Finaliza_apto',
        diploma: 'Diploma',
        jornada_laboral: true,
        fijo_discontinuo: false,
        categoria_profesional: 'Técnico',
        ERTE: false
      }
    });

    await prisma.alumnosPersonaGrupo.create({
      data: {
        id_persona: persona4.id_persona,
        id_grupo: grupo2.id_grupo,
        id_centro: centro2.id_centro,
        fecha_inscripcion: new Date('2024-01-10'),
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 2,
        estado_curso: 'Finalizado',
        progreso_curso: 'Finaliza_apto',
        diploma: 'Diploma',
        jornada_laboral: false,
        fijo_discontinuo: true,
        categoria_profesional: 'Mando_Intermedio',
        ERTE: false
      }
    });

    // 10. Crear Docentes en Grupos
    console.log('Creando docentes en grupos...');
    await prisma.docentesPersonaGrupo.create({
      data: {
        id_persona: persona1.id_persona,
        id_grupo: grupo1.id_grupo,
        fecha_asignacion: new Date('2024-01-25'),
        tutoria: true,
        tipotutoria: 'Videoconferencia_2',
        descripcion: 'Tutor principal del grupo de desarrollo web'
      }
    });

    await prisma.docentesPersonaGrupo.create({
      data: {
        id_persona: persona2.id_persona,
        id_grupo: grupo2.id_grupo,
        fecha_asignacion: new Date('2024-01-10'),
        tutoria: true,
        tipotutoria: 'Presencial_3',
        descripcion: 'Tutor principal del grupo de administración Linux'
      }
    });

    // 11. Crear Documentación Adjunta
    console.log('Creando documentación adjunta...');
    
    // Documentación de alumnos
    await prisma.documentacionAdjAlumnoGrupo.create({
      data: {
        id_alumno_grupo: 1,
        tipo_documento: 'DNI',
        nombre_archivo: 'dni_carlos_ruiz.pdf',
        url_blob: 'https://storage.blob.core.windows.net/documentos/dni_carlos_ruiz.pdf',
        fecha_subida: new Date('2024-01-20')
      }
    });

    // Documentación de docentes
    await prisma.documentacionAdjDocenteGrupo.create({
      data: {
        id_docente_grupo: 1,
        tipo_documento: 'Título Universitario',
        nombre_archivo: 'titulo_juan_perez.pdf',
        url_blob: 'https://storage.blob.core.windows.net/documentos/titulo_juan_perez.pdf',
        fecha_subida: new Date('2024-01-25')
      }
    });

    // Documentación de empresas
    await prisma.documentacionAdjEmpresa.create({
      data: {
        id_empresa: empresa1.id_empresa,
        tipo_documento: 'Certificado de Empresa',
        nombre_archivo: 'certificado_tecnologia_avanzada.pdf',
        url_blob: 'https://storage.blob.core.windows.net/documentos/certificado_tecnologia_avanzada.pdf',
        fecha_subida: new Date('2024-01-15')
      }
    });

    // 12. Crear Tareas
    console.log('Creando tareas...');
    await prisma.tareas.create({
      data: {
        nombre_tarea: 'Revisar documentación del Plan de Formación Digital 2024',
        estado: 'Completada',
        observaciones: 'Documentación revisada y aprobada',
        autor_azure_id: 'user123@azure.com',
        responsable_azure_id: 'manager456@azure.com'
      }
    });

    await prisma.tareas.create({
      data: {
        nombre_tarea: 'Validar inscripciones del grupo de desarrollo web',
        estado: 'Pendiente',
        observaciones: 'Pendiente de validar 15 inscripciones',
        autor_azure_id: 'admin789@azure.com',
        responsable_azure_id: 'coordinator123@azure.com'
      }
    });

    console.log('Seed completado exitosamente!');
    console.log('Resumen de datos creados:');
    console.log(`   - ${await prisma.areaProfesional.count()} áreas profesionales`);
    console.log(`   - ${await prisma.desgloseAreasProfesionales.count()} desgloses de áreas`);
    console.log(`   - ${await prisma.planes.count()} planes`);
    console.log(`   - ${await prisma.accionesFormativas.count()} acciones formativas`);
    console.log(`   - ${await prisma.empresas.count()} empresas`);
    console.log(`   - ${await prisma.centrosTrabajo.count()} centros de trabajo`);
    console.log(`   - ${await prisma.personas.count()} personas`);
    console.log(`   - ${await prisma.grupos.count()} grupos`);
    console.log(`   - ${await prisma.alumnosPersonaGrupo.count()} alumnos en grupos`);
    console.log(`   - ${await prisma.docentesPersonaGrupo.count()} docentes en grupos`);
    console.log(`   - ${await prisma.documentacionAdjAlumnoGrupo.count()} documentos de alumnos`);
    console.log(`   - ${await prisma.documentacionAdjDocenteGrupo.count()} documentos de docentes`);
    console.log(`   - ${await prisma.documentacionAdjEmpresa.count()} documentos de empresas`);
    console.log(`   - ${await prisma.tareas.count()} tareas`);

  } catch (error) {
    console.error(' Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
