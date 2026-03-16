const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Limpiar datos existentes (en orden inverso por las relaciones)
    console.log('🧹 Limpiando datos existentes...');
    await prisma.documentacionAdjAlumnoPersona.deleteMany();
    await prisma.documentacionAdjDocentePersona.deleteMany();
    await prisma.documentacionAdjEmpresa.deleteMany();
    await prisma.tareas.deleteMany();
    await prisma.costesGrupo.deleteMany();
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
    console.log('📚 Creando áreas profesionales...');
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
    console.log('🎓 Creando acciones formativas...');
    
    // Acción formativa basada en el XML proporcionado
    const accionXML = await prisma.accionesFormativas.create({
      data: {
        denominacion: 'Acción Formativa 0004',
        numero_accion: '0004',
        modalidad: 'Mixta',
        id_area: area2.id_area, // Usando área ADGD (Administración y Gestión)
        id_desglose: desglose3.id_desglose, // Desglose de administración
        codigo_grupo_accion: '087-06',
        horas_modalidad_presencial: 20,
        horas_modalidad_teleformacion: 80,
        cif_plataforma: 'A00000000',
        razon_social_plataforma: 'Razón Social Plataforma',
        uri: 'www.fundae.es',
        usuario: 'UsuarioPlataforma',
        password: 'Contraseña',
        observaciones: 'OBSERVACIONES 004',
        nivel_formacion: 'BASICO', // Nivel 1 corresponde a básico
        objetivos: 'Estos son los objetivos de la Acción Formativa 0004',
        contenido: 'Estos son los contenidos de la Acción Formativa 0004',
        participantes: 15,
        id_plan: plan1.id_plan
      }
    });

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
        participantes: 25,
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
        participantes: 15,
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
        participantes: 30,
        id_plan: plan2.id_plan
      }
    });

    // 5. Crear Empresas
    console.log('🏢 Creando empresas...');
    
    // Empresas participantes del XML
    const empresaXML1 = await prisma.empresas.create({
      data: {
        razon_social: 'Empresa Participante B00000000',
        CIF: 'B00000000',
        NSS: '1234567890',
        direccion: 'Calle Empresa B, 123, 28001 Madrid',
        persona_contacto: 'Contacto Empresa B',
        telefono1: '911234567',
        sector_actividad: 'Servicios Empresariales',
        CNAE: '8211',
        CNAE2009: '8211',
        correo_electronico: 'contacto@empresa-b.com',
        pagina_web: 'https://www.empresa-b.com',
        nombre_representante: 'Representante B',
        NIF_representante: '12345678B',
        informa_RLT: 'Sí',
        valor_informe: 'D', // Valor 'd' del XML
        fecha_discrepancia: new Date('2013-01-01'),
        resuelto: true, // resuelto15 = 'S'
        comentarios: 'Empresa participante con discrepancia resuelta'
      }
    });

    const empresaXML2 = await prisma.empresas.create({
      data: {
        razon_social: 'Empresa Participante D00000000',
        CIF: 'D00000000',
        NSS: '0987654321',
        direccion: 'Calle Empresa D, 456, 41001 Sevilla',
        persona_contacto: 'Contacto Empresa D',
        telefono1: '954123456',
        sector_actividad: 'Servicios Administrativos',
        CNAE: '8211',
        CNAE2009: '8211',
        correo_electronico: 'contacto@empresa-d.com',
        pagina_web: 'https://www.empresa-d.com',
        nombre_representante: 'Representante D',
        NIF_representante: '87654321D',
        informa_RLT: 'Sí',
        valor_informe: 'F', // Valor 'f' del XML
        fecha_discrepancia: null,
        resuelto: false,
        comentarios: 'Empresa participante sin discrepancias'
      }
    });

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
    console.log('🏭 Creando centros de trabajo...');
    
    // Centros de trabajo para las empresas participantes del XML
    const centroXML1 = await prisma.centrosTrabajo.create({
      data: {
        nombre: 'Centro Empresa B00000000',
        NSS: '1234567890',
        direccion: 'Calle Empresa B, 123, 28001 Madrid',
        persona_contacto: 'Contacto Empresa B',
        telefono1: '911234567',
        correo_electronico: 'centro@empresa-b.com',
        cuenta_bancaria: 'ES1234567890123456789012',
        IBAN: 'ES1234567890123456789012',
        BIC: 'CAIXESBBXXX',
        id_empresa: empresaXML1.id_empresa
      }
    });

    const centroXML2 = await prisma.centrosTrabajo.create({
      data: {
        nombre: 'Centro Empresa D00000000',
        NSS: '0987654321',
        direccion: 'Calle Empresa D, 456, 41001 Sevilla',
        persona_contacto: 'Contacto Empresa D',
        telefono1: '954123456',
        correo_electronico: 'centro@empresa-d.com',
        cuenta_bancaria: 'ES9876543210987654321098',
        IBAN: 'ES9876543210987654321098',
        BIC: 'BBVAESMMXXX',
        id_empresa: empresaXML2.id_empresa
      }
    });

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
    console.log('👥 Creando personas...');
    const persona1 = await prisma.personas.create({
      data: {
        tipoDocumento: 'NIF',
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
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 3,
        comentarios: 'Experto en desarrollo web'
      }
    });

    const persona2 = await prisma.personas.create({
      data: {
        tipoDocumento: 'NIF',
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
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 3,
        comentarios: 'Especialista en administración de sistemas'
      }
    });

    const persona3 = await prisma.personas.create({
      data: {
        tipoDocumento: 'NIF',
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
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 2,
        comentarios: 'Estudiante de desarrollo web'
      }
    });

    const persona4 = await prisma.personas.create({
      data: {
        tipoDocumento: 'NIF',
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
        discapacidad: true,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 1,
        comentarios: 'Estudiante de administración'
      }
    });

    // Personas (alumnos) para las empresas participantes del XML
    const personaXML1 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '11111111A',
        nombre: 'Alumno',
        apellido1: 'Empresa',
        apellido2: 'B',
        telefono: '611111111',
        correoElectronico: 'alumno.empresa.b@email.com',
        NSS: '1111111111111',
        es_docente: false,
        es_alumno: true,
        fecha_nacimiento: new Date('1990-01-15'),
        sexo: 'Hombre',
        domicilio: 'Calle Empresa B, 123, 28001 Madrid',
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 2,
        comentarios: 'Alumno de la empresa B00000000'
      }
    });

    const personaXML2 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '22222222B',
        nombre: 'Alumno',
        apellido1: 'Empresa',
        apellido2: 'D',
        telefono: '622222222',
        correoElectronico: 'alumno.empresa.d@email.com',
        NSS: '2222222222222',
        es_docente: false,
        es_alumno: true,
        fecha_nacimiento: new Date('1992-05-20'),
        sexo: 'Mujer',
        domicilio: 'Calle Empresa D, 456, 41001 Sevilla',
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 2,
        comentarios: 'Alumno de la empresa D00000000'
      }
    });

    // Personas basadas en FinGrupoOrganizadora.xml
    const personaFin1 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '00000001R',
        nombre: 'Participante',
        apellido1: 'Fin',
        apellido2: 'Uno',
        telefono: '666666661',
        correoElectronico: 'mail@fundae.es',
        NSS: '1111111111111',
        es_docente: false,
        es_alumno: true,
        fecha_nacimiento: new Date('1990-01-01'),
        sexo: 'Hombre',
        domicilio: 'Calle Participante 1, 28001 Madrid',
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 4,
        comentarios: 'Participante del grupo fin XML - ERTE activo'
      }
    });

    const personaFin2 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '00000002W',
        nombre: 'Participante',
        apellido1: 'Fin',
        apellido2: 'Dos',
        telefono: '666666661',
        correoElectronico: 'mail@fundae.es',
        NSS: '2222222222222',
        es_docente: false,
        es_alumno: true,
        fecha_nacimiento: new Date('1991-02-02'),
        sexo: 'Mujer',
        domicilio: 'Calle Participante 2, 28001 Madrid',
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 4,
        comentarios: 'Participante del grupo fin XML - Sin ERTE'
      }
    });

    const personaFin3 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '00000003A',
        nombre: 'Participante',
        apellido1: 'Fin',
        apellido2: 'Tres',
        telefono: '666666651',
        correoElectronico: 'mail@fundae.es',
        NSS: '3333333333333',
        es_docente: false,
        es_alumno: true,
        fecha_nacimiento: new Date('1992-03-03'),
        sexo: 'Hombre',
        domicilio: 'Calle Participante 3, 28001 Madrid',
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 3,
        comentarios: 'Participante del grupo fin XML - Categoría 2'
      }
    });

    const personaFin4 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '00000004G',
        nombre: 'Participante',
        apellido1: 'Fin',
        apellido2: 'Cuatro',
        telefono: '666666661',
        correoElectronico: 'mail@fundae.es',
        NSS: '4444444444444',
        es_docente: false,
        es_alumno: true,
        fecha_nacimiento: new Date('1993-04-04'),
        sexo: 'Mujer',
        domicilio: 'Calle Participante 4, 28001 Madrid',
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 4,
        comentarios: 'Participante del grupo fin XML - Categoría 3'
      }
    });

    // Tutores basados en InicioGruposOrganizadora.xml
    const tutorInicio1 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '00000003R',
        nombre: 'Nombre',
        apellido1: 'Primer Apellido',
        apellido2: 'Segundo Apellido',
        telefono: '916666666',
        correoElectronico: 'c@c.com',
        NSS: '5555555555555',
        es_docente: true,
        es_alumno: false,
        fecha_nacimiento: new Date('1980-01-01'),
        sexo: 'Hombre',
        domicilio: 'Calle Tutor 1, 28001 Madrid',
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 4,
        comentarios: 'Tutor del grupo inicio XML - 5 horas'
      }
    });

    const tutorInicio2 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '00000004W',
        nombre: 'Nombre 1',
        apellido1: 'Primer Apellido',
        apellido2: 'Segundo Apellido',
        telefono: '917777777',
        correoElectronico: 'a@a.com',
        NSS: '6666666666666',
        es_docente: true,
        es_alumno: false,
        fecha_nacimiento: new Date('1981-02-02'),
        sexo: 'Mujer',
        domicilio: 'Calle Tutor 2, 28001 Madrid',
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 4,
        comentarios: 'Tutor del grupo inicio XML - 5 horas'
      }
    });

    // Segundo tutor presencial
    const tutorInicio3 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '00000005X',
        nombre: 'Nombre 2',
        apellido1: 'Primer Apellido',
        apellido2: 'Segundo Apellido',
        telefono: '918888888',
        correoElectronico: 'd@d.com',
        NSS: '7777777777777',
        es_docente: true,
        es_alumno: false,
        fecha_nacimiento: new Date('1982-03-03'),
        sexo: 'Hombre',
        domicilio: 'Calle Tutor 3, 28001 Madrid',
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 4,
        comentarios: 'Segundo tutor presencial del grupo inicio XML - 5 horas'
      }
    });

    // Segundo tutor de teleformación
    const tutorInicio4 = await prisma.personas.create({
      data: {
        tipoDocumento: 'DNI',
        documento: '00000006Y',
        nombre: 'Nombre uno',
        apellido1: 'Primer Apellido',
        apellido2: 'Segundo Apellido',
        telefono: '919999999',
        correoElectronico: 'b@b.com',
        NSS: '8888888888888',
        es_docente: true,
        es_alumno: false,
        fecha_nacimiento: new Date('1983-04-04'),
        sexo: 'Mujer',
        domicilio: 'Calle Tutor 4, 28001 Madrid',
        discapacidad: false,
        afectadosTerrorismo: false,
        afectadosViolenciaGenero: false,
        nivel_estudios: 4,
        comentarios: 'Segundo tutor teleformación del grupo inicio XML - 5 horas'
      }
    });

    // 8. Crear Grupos
    console.log('👥 Creando grupos...');
    
    // Grupo para la acción formativa del XML
    const grupoXML = await prisma.grupos.create({
      data: {
        estado: 'En Ejecucion',
        codigo: 'GRP-XML-0004',
        fecha_inicio: new Date('2024-03-01'),
        fecha_fin: new Date('2024-07-31'),
        denominacion: 'Grupo Acción Formativa 0004',
        responsable: 'Responsable XML',
        telefono_responsable: '611234567',
        observaciones: 'Grupo para la acción formativa 0004 del XML',
        centro_cif: 'A00000000',
        centro_nombre: 'Centro Plataforma',
        centro_direccion: 'Calle Plataforma, 123, 28001 Madrid',
        centro_codPostal: '28001',
        centro_localidad: 'Madrid',
        lugar_imparticion_nombre: 'Aula Virtual',
        lugar_imparticion_direccion: 'Calle Plataforma, 123, 28001 Madrid',
        lugar_imparticion_codPostal: '28001',
        lugar_imparticion_localidad: 'Madrid',
        horas_totales_presencial_horario: 20,
        hora_inicio_tramo1_presencial_horario: new Date('1970-01-01T09:00:00.000Z'),
        hora_fin_tramo1_presencial_horario: new Date('1970-01-01T13:00:00.000Z'),
        dias_presencial_horario: 'Lunes, Miércoles',
        hora_inicio_tramo2_presencial_horario: new Date('1970-01-01T15:00:00.000Z'),
        hora_fin_tramo2_presencial_horario: new Date('1970-01-01T19:00:00.000Z'),
        aula_virtual: true,
        medio_aula_virtual: 'Moodle',
        conexion_aula_virtual: 'www.fundae.es',
        contacto_aula_virtual: 'UsuarioPlataforma',
        telefono_aula_virtual: '611234567',
        bimodal_aula_virtual: true,
        sin_participantes_en_centro_aula_virtual: false,
        sin_docentes_en_centro_aula_virtual: false,
        tele_centro_cif: 'A00000000',
        tele_centro_nombre: 'Centro Plataforma',
        tele_centro_direccion: 'Calle Plataforma, 123, 28001 Madrid',
        tele_centro_codPostal: '28001',
        tele_centro_localidad: 'Madrid',
        tele_telefono: '611234567',
        horas_totales_teleformacion: 80,
        hora_inicio_tramo1_tele: new Date('1970-01-01T16:00:00.000Z'),
        hora_fin_tramo1_tele: new Date('1970-01-01T20:00:00.000Z'),
        dias_tele: 'Martes, Jueves, Viernes',
        id_accion: accionXML.id_accion,
        moodle_grupo_id: 'GRP-XML-0004-MOODLE'
      }
    });

    // Grupo basado en InicioGruposOrganizadora.xml
    const grupoInicioXML = await prisma.grupos.create({
      data: {
        estado: 'En Ejecucion',
        codigo: 'GRP-INICIO-002',
        fecha_inicio: new Date('2021-01-01'),
        fecha_fin: new Date('2021-04-01'),
        denominacion: 'Ejemplo grupo formativo',
        responsable: 'Responsable',
        telefono_responsable: '988888888',
        observaciones: 'Ejemplo observaciones',
        centro_cif: 'A00000000',
        centro_nombre: 'Centro presencial',
        centro_direccion: 'Dirección detallada',
        centro_codPostal: '28033',
        centro_localidad: 'Madrid',
        lugar_imparticion_nombre: 'Lugar impartición',
        lugar_imparticion_direccion: 'Dirección Detallada',
        lugar_imparticion_codPostal: '28033',
        lugar_imparticion_localidad: 'Madrid',
        horas_totales_presencial_horario: 10,
        hora_inicio_tramo1_presencial_horario: new Date('1970-01-01T07:00:00.000Z'),
        hora_fin_tramo1_presencial_horario: new Date('1970-01-01T12:00:00.000Z'),
        dias_presencial_horario: 'LM',
        hora_inicio_tramo2_presencial_horario: new Date('1970-01-01T16:00:00.000Z'),
        hora_fin_tramo2_presencial_horario: new Date('1970-01-01T18:00:00.000Z'),
        aula_virtual: true,
        medio_aula_virtual: 'Medio utilizado aula virtual',
        conexion_aula_virtual: 'Modo conexión aula virtual',
        contacto_aula_virtual: 'Persona de contacto aula virtual',
        telefono_aula_virtual: '910123456',
        bimodal_aula_virtual: false,
        sin_participantes_en_centro_aula_virtual: true,
        sin_docentes_en_centro_aula_virtual: false,
        tele_centro_cif: 'A00000000',
        tele_centro_nombre: 'Centro Asistencia Teleformación',
        tele_centro_direccion: 'Dir Asistencia Teleformación',
        tele_centro_codPostal: '28033',
        tele_centro_localidad: 'Madrid',
        tele_telefono: '922222222',
        horas_totales_teleformacion: 8,
        hora_inicio_tramo1_tele: new Date('1970-01-01T10:00:00.000Z'),
        hora_fin_tramo1_tele: new Date('1970-01-01T12:00:00.000Z'),
        dias_tele: 'LMXJ',
        id_accion: accion1.id_accion, // Asociado a la primera acción formativa
        moodle_grupo_id: 'GRP-INICIO-002-MOODLE'
      }
    });

    const grupo1 = await prisma.grupos.create({
      data: {
        estado: 'En Ejecucion',
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
        hora_inicio_tramo2_presencial_horario: new Date('1970-01-01T15:00:00.000Z'),
        hora_fin_tramo2_presencial_horario: new Date('1970-01-01T19:00:00.000Z'),
        aula_virtual: true,
        medio_aula_virtual: 'Moodle',
        conexion_aula_virtual: 'https://aula.tecnologia-avanzada.com',
        contacto_aula_virtual: 'Ana Martínez',
        telefono_aula_virtual: '911234567',
        bimodal_aula_virtual: true,
        sin_participantes_en_centro_aula_virtual: true,
        sin_docentes_en_centro_aula_virtual: false,
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
        id_accion: accion1.id_accion,
        moodle_grupo_id: 'GRP-001-MOODLE-2024'
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
        hora_inicio_tramo2_presencial_horario: new Date('1970-01-01T15:00:00.000Z'),
        hora_fin_tramo2_presencial_horario: new Date('1970-01-01T19:00:00.000Z'),
        aula_virtual: false,
        id_accion: accion2.id_accion,
        moodle_grupo_id: 'GRP-002-MOODLE-2024'
      }
    });

    // 9. Crear Costes de Grupos
    console.log('💰 Creando costes de grupos...');
    
    // Costes para el grupo XML
    await prisma.costesGrupo.create({
      data: {
        id_grupo: grupoXML.id_grupo,
        cif: 'A00000000',
        directos: 10000.00,
        indirectos: 2000.00,
        organizacion: 1500.00,
        salariales: 8000.00,
        periodos_enero: 0.00,
        periodos_febrero: 0.00,
        periodos_marzo: 2000.00,
        periodos_abril: 2000.00,
        periodos_mayo: 2000.00,
        periodos_junio: 2000.00,
        periodos_julio: 2000.00,
        periodos_agosto: 0.00,
        periodos_septiembre: 0.00,
        periodos_octubre: 0.00,
        periodos_noviembre: 0.00,
        periodos_diciembre: 0.00
      }
    });

    await prisma.costesGrupo.create({
      data: {
        id_grupo: grupo1.id_grupo,
        cif: 'B12345678',
        directos: 15000.50,
        indirectos: 3500.75,
        organizacion: 2000.00,
        salariales: 12000.25,
        periodos_enero: 1500.00,
        periodos_febrero: 1800.50,
        periodos_marzo: 2200.75,
        periodos_abril: 2100.25,
        periodos_mayo: 1900.00,
        periodos_junio: 1600.50,
        periodos_julio: 0.00,
        periodos_agosto: 0.00,
        periodos_septiembre: 0.00,
        periodos_octubre: 0.00,
        periodos_noviembre: 0.00,
        periodos_diciembre: 0.00
      }
    });

    await prisma.costesGrupo.create({
      data: {
        id_grupo: grupo2.id_grupo,
        cif: 'A87654321',
        directos: 12000.00,
        indirectos: 2800.50,
        organizacion: 1500.25,
        salariales: 9500.75,
        periodos_enero: 1200.00,
        periodos_febrero: 1400.25,
        periodos_marzo: 1600.50,
        periodos_abril: 1500.75,
        periodos_mayo: 1300.00,
        periodos_junio: 0.00,
        periodos_julio: 0.00,
        periodos_agosto: 0.00,
        periodos_septiembre: 0.00,
        periodos_octubre: 0.00,
        periodos_noviembre: 0.00,
        periodos_diciembre: 0.00
      }
    });

    // Costes para el grupo inicio XML basados en FinGrupoOrganizadora.xml
    await prisma.costesGrupo.create({
      data: {
        id_grupo: grupoInicioXML.id_grupo,
        cif: 'B00000000',
        directos: 1500.00,
        indirectos: 2000.00,
        organizacion: 500.00,
        salariales: 1500.00,
        periodos_enero: 0.00,
        periodos_febrero: 0.00,
        periodos_marzo: 0.00,
        periodos_abril: 0.00,
        periodos_mayo: 0.00,
        periodos_junio: 0.00,
        periodos_julio: 0.00,
        periodos_agosto: 0.00,
        periodos_septiembre: 0.00,
        periodos_octubre: 900.00, // mes 10
        periodos_noviembre: 100.00, // mes 11
        periodos_diciembre: 0.00
      }
    });

    await prisma.costesGrupo.create({
      data: {
        id_grupo: grupoInicioXML.id_grupo,
        cif: 'C00000000',
        directos: 400.00,
        indirectos: 500.00,
        organizacion: 500.00,
        salariales: 300.00,
        periodos_enero: 0.00,
        periodos_febrero: 0.00,
        periodos_marzo: 0.00,
        periodos_abril: 0.00,
        periodos_mayo: 0.00,
        periodos_junio: 0.00,
        periodos_julio: 0.00,
        periodos_agosto: 0.00,
        periodos_septiembre: 0.00,
        periodos_octubre: 0.00,
        periodos_noviembre: 0.00,
        periodos_diciembre: 0.00
      }
    });

    // 10. Crear Alumnos en Grupos
    console.log('🎓 Creando alumnos en grupos...');
    
    // Alumnos para el grupo XML (empresas participantes)
    const alumnoXML1 = await prisma.alumnosPersonaGrupo.create({
      data: {
        id_persona: personaXML1.id_persona,
        id_grupo: grupoXML.id_grupo,
        id_centro: centroXML1.id_centro,
        fecha_inscripcion: new Date('2024-02-20'),
        estado_curso: 'En_Curso',
        progreso_curso: 'En_Progreso',
        diploma: 'Diploma',
        jornada_laboral: true,
        fijo_discontinuo: false,
        categoria_profesional: 'Técnico',
        ERTE: false
      }
    });

    const alumnoXML2 = await prisma.alumnosPersonaGrupo.create({
      data: {
        id_persona: personaXML2.id_persona,
        id_grupo: grupoXML.id_grupo,
        id_centro: centroXML2.id_centro,
        fecha_inscripcion: new Date('2024-02-20'),
        estado_curso: 'En_Curso',
        progreso_curso: 'En_Progreso',
        diploma: 'Diploma',
        jornada_laboral: true,
        fijo_discontinuo: false,
        categoria_profesional: 'Técnico',
        ERTE: false
      }
    });

    // Alumnos para el grupo inicio XML
    const alumnoInicio1 = await prisma.alumnosPersonaGrupo.create({
      data: {
        id_persona: personaFin1.id_persona,
        id_grupo: grupoInicioXML.id_grupo,
        id_centro: centro1.id_centro,
        fecha_inscripcion: new Date('2021-01-01'),
        estado_curso: 'Finalizado',
        progreso_curso: 'Finaliza Apto',
        diploma: 'Diploma',
        jornada_laboral: true,
        fijo_discontinuo: true,
        categoria_profesional: 'Técnico',
        ERTE: true // ERTE_RD_ley: true
      }
    });

    const alumnoInicio2 = await prisma.alumnosPersonaGrupo.create({
      data: {
        id_persona: personaFin2.id_persona,
        id_grupo: grupoInicioXML.id_grupo,
        id_centro: centro1.id_centro,
        fecha_inscripcion: new Date('2021-01-01'),
        estado_curso: 'Finalizado',
        progreso_curso: 'Finaliza Apto',
        diploma: 'Diploma',
        jornada_laboral: true,
        fijo_discontinuo: false,
        categoria_profesional: 'Técnico',
        ERTE: false // ERTE_RD_ley: false
      }
    });

    const alumno1 = await prisma.alumnosPersonaGrupo.create({
      data: {
        id_persona: persona3.id_persona,
        id_grupo: grupo1.id_grupo,
        id_centro: centro1.id_centro,
        fecha_inscripcion: new Date('2024-01-20'),
        estado_curso: 'Finalizado',
        progreso_curso: 'Finaliza Apto',
        diploma: 'Diploma',
        jornada_laboral: true,
        fijo_discontinuo: false,
        categoria_profesional: 'Técnico',
        ERTE: false
      }
    });

    const alumno2 = await prisma.alumnosPersonaGrupo.create({
      data: {
        id_persona: persona4.id_persona,
        id_grupo: grupo2.id_grupo,
        id_centro: centro2.id_centro,
        fecha_inscripcion: new Date('2024-01-10'),
        estado_curso: 'Finalizado',
        progreso_curso: 'Finaliza Apto',
        diploma: 'Diploma',
        jornada_laboral: false,
        fijo_discontinuo: true,
        categoria_profesional: 'Mando Intermedio',
        ERTE: false
      }
    });

    // 11. Crear Docentes en Grupos
    console.log('👨‍🏫 Creando docentes en grupos...');
    const docente1 = await prisma.docentesPersonaGrupo.create({
      data: {
        id_persona: persona1.id_persona,
        id_grupo: grupo1.id_grupo,
        fecha_asignacion: new Date('2024-01-25'),
        tutoria: true,
        tipotutoria: 'Videoconferencia (2)',
        descripcion: 'Tutor principal del grupo de desarrollo web',
        modalidad: 'Teleformacion'
      }
    });

    const docente2 = await prisma.docentesPersonaGrupo.create({
      data: {
        id_persona: persona2.id_persona,
        id_grupo: grupo2.id_grupo,
        fecha_asignacion: new Date('2024-01-10'),
        tutoria: true,
        tipotutoria: 'Foro (3)',
        descripcion: 'Tutor principal del grupo de administración Linux',
        modalidad: 'Presencial'
      }
    });

    // Docentes para el grupo inicio XML
    const docenteInicio1 = await prisma.docentesPersonaGrupo.create({
      data: {
        id_persona: tutorInicio1.id_persona,
        id_grupo: grupoInicioXML.id_grupo,
        fecha_asignacion: new Date('2021-01-01'),
        tutoria: true,
        tipotutoria: 'Correo electrónico (1)',
        descripcion: 'Tutor presencial - 5 horas',
        modalidad: 'Presencial'
      }
    });

    const docenteInicio2 = await prisma.docentesPersonaGrupo.create({
      data: {
        id_persona: tutorInicio2.id_persona,
        id_grupo: grupoInicioXML.id_grupo,
        fecha_asignacion: new Date('2021-01-01'),
        tutoria: true,
        tipotutoria: 'Videoconferencia (2)',
        descripcion: 'Tutor teleformación - 5 horas',
        modalidad: 'Teleformacion'
      }
    });

    // Segundo tutor presencial
    const docenteInicio3 = await prisma.docentesPersonaGrupo.create({
      data: {
        id_persona: tutorInicio3.id_persona,
        id_grupo: grupoInicioXML.id_grupo,
        fecha_asignacion: new Date('2021-01-01'),
        tutoria: true,
        tipotutoria: 'Correo electrónico (1)',
        descripcion: 'Segundo tutor presencial - 5 horas',
        modalidad: 'Presencial'
      }
    });

    // Segundo tutor de teleformación
    const docenteInicio4 = await prisma.docentesPersonaGrupo.create({
      data: {
        id_persona: tutorInicio4.id_persona,
        id_grupo: grupoInicioXML.id_grupo,
        fecha_asignacion: new Date('2021-01-01'),
        tutoria: true,
        tipotutoria: 'Otras (4)',
        descripcion: 'Segundo tutor teleformación - 5 horas',
        modalidad: 'Teleformacion'
      }
    });

    // 12. Crear Documentación Adjunta
    console.log('📄 Creando documentación adjunta...');
    
    // Documentación de alumnos
    await prisma.documentacionAdjAlumnoPersona.create({
      data: {
        id_persona: persona1.id_persona,
        tipo_documento: 'NIF',
        nombre_archivo: 'dni_carlos_ruiz.pdf',
        url_blob: 'https://storage.blob.core.windows.net/documentos/dni_carlos_ruiz.pdf',
        fecha_subida: new Date('2024-01-20')
      }
    });

    // Documentación de docentes
    await prisma.documentacionAdjDocentePersona.create({
      data: {
        id_persona: persona2.id_persona,
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

    // 13. Crear Tareas
    console.log('Creando tareas...');
    await prisma.tareas.create({
      data: {
        nombre_tarea: 'Revisar documentación del Plan de Formación Digital 2024',
        id_grupo: grupo1.id_grupo,
        estado: 'Completada',
        observaciones: 'Documentación revisada y aprobada',
        autor_azure_id: 'user123@azure.com',
        responsable_azure_id: 'manager456@azure.com'
      }
    });

    await prisma.tareas.create({
      data: {
        nombre_tarea: 'Validar inscripciones del grupo de desarrollo web',
        id_grupo: grupo2.id_grupo,
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
    console.log(`   - ${await prisma.costesGrupo.count()} costes de grupos`);
    console.log(`   - ${await prisma.alumnosPersonaGrupo.count()} alumnos en grupos`);
    console.log(`   - ${await prisma.docentesPersonaGrupo.count()} docentes en grupos`);
    console.log(`   - ${await prisma.documentacionAdjAlumnoPersona.count()} documentos de alumnos`);
    console.log(`   - ${await prisma.documentacionAdjDocentePersona.count()} documentos de docentes`);
    console.log(`   - ${await prisma.documentacionAdjEmpresa.count()} documentos de empresas`);
    console.log(`   - ${await prisma.tareas.count()} tareas`);

  } catch (error) {
    console.error('Error durante el seed:', error);
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
