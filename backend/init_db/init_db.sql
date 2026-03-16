-- Script de inicialización de base de datos para SQL Server de Azure
-- Este script crea todas las tablas necesarias para la aplicación Praxis

-- Crear tabla AccionesFormativas
CREATE TABLE [AccionesFormativas] (
	[id_accion] INT IDENTITY(1,1) NOT NULL,
	[denominacion] NVARCHAR(255) NOT NULL,
	[numero_accion] NVARCHAR(50) NULL,
	[modalidad] NVARCHAR(50) NOT NULL,
	[id_area] INT NULL,
	[id_desglose] INT NULL,
	[codigo_grupo_accion] NVARCHAR(1000) NULL,
	[horas_modalidad_presencial] INT NULL,
	[horas_modalidad_teleformacion] INT NULL,
	[cif_plataforma] NVARCHAR(50) NULL,
	[razon_social_plataforma] NVARCHAR(255) NULL,
	[uri] NVARCHAR(500) NULL,
	[usuario] NVARCHAR(100) NULL,
	[password] NVARCHAR(100) NULL,
	[observaciones] NVARCHAR(MAX) NULL,
	[nivel_formacion] NVARCHAR(50) NULL,
	[objetivos] NVARCHAR(MAX) NULL,
	[contenido] NVARCHAR(MAX) NULL,
	[participantes] INT NULL,
	[id_plan] INT NULL,
	CONSTRAINT [PK_AccionesFormativas] PRIMARY KEY ([id_accion])
);

-- Crear tabla AreaProfesional
CREATE TABLE [AreaProfesional] (
	[id_area] INT IDENTITY(1,1) NOT NULL,
	[abreviatura] NVARCHAR(20) NOT NULL,
	[nombre] NVARCHAR(255) NOT NULL,
	CONSTRAINT [PK_AreaProfesional] PRIMARY KEY ([id_area])
);

-- Crear tabla DesgloseAreasProfesionales
CREATE TABLE [DesgloseAreasProfesionales] (
	[id_desglose] INT IDENTITY(1,1) NOT NULL,
	[id_area] INT NOT NULL,
	[codigo_grupo] NVARCHAR(50) NOT NULL,
	[desglose] NVARCHAR(255) NOT NULL,
	CONSTRAINT [PK_DesgloseAreasProfesionales] PRIMARY KEY ([id_desglose])
);

-- Crear tabla Planes
CREATE TABLE [Planes] (
	[id_plan] INT IDENTITY(1,1) NOT NULL,
	[expediente] NVARCHAR(100) NULL,
	[estado] NVARCHAR(50) NOT NULL,
	[nombre] NVARCHAR(255) NOT NULL,
	[solicitante] NVARCHAR(255) NULL,
	[fecha_convocatoria_plan] INT NULL,
	[responsable] NVARCHAR(255) NULL,
	[fecha_inicio] DATE NULL,
	[fecha_fin] DATE NULL,
	[tipo_bonificacion] NVARCHAR(50) NULL,
	CONSTRAINT [PK_Planes] PRIMARY KEY ([id_plan])
);

-- Crear tabla Empresas
CREATE TABLE [Empresas] (
	[id_empresa] INT IDENTITY(1,1) NOT NULL,
	[razon_social] NVARCHAR(255) NOT NULL,
	[CIF] NVARCHAR(50) NULL,
	[NSS] NVARCHAR(50) NULL,
	[direccion] NVARCHAR(255) NULL,
	[persona_contacto] NVARCHAR(255) NULL,
	[telefono1] NVARCHAR(20) NULL,
	[telefono2] NVARCHAR(20) NULL,
	[fax] NVARCHAR(20) NULL,
	[sector_actividad] NVARCHAR(255) NULL,
	[CNAE] NVARCHAR(50) NULL,
	[CNAE2009] NVARCHAR(50) NULL,
	[correo_electronico] NVARCHAR(100) NULL,
	[pagina_web] NVARCHAR(255) NULL,
	[nombre_representante] NVARCHAR(255) NULL,
	[NIF_representante] NVARCHAR(50) NULL,
	[informa_RLT] NVARCHAR(255) NULL,
	[valor_informe] NVARCHAR(10) NULL,
	[fecha_discrepancia] DATE NULL,
	[resuelto] BIT NOT NULL DEFAULT 0,
	[comentarios] NVARCHAR(MAX) NULL,
	CONSTRAINT [PK_Empresas] PRIMARY KEY ([id_empresa])
);

-- Crear tabla CentrosTrabajo
CREATE TABLE [CentrosTrabajo] (
	[id_centro] INT IDENTITY(1,1) NOT NULL,
	[nombre] NVARCHAR(255) NOT NULL,
	[NSS] NVARCHAR(50) NULL,
	[direccion] NVARCHAR(255) NULL,
	[persona_contacto] NVARCHAR(255) NULL,
	[telefono1] NVARCHAR(20) NULL,
	[telefono2] NVARCHAR(20) NULL,
	[fax] NVARCHAR(20) NULL,
	[correo_electronico] NVARCHAR(100) NULL,
	[cuenta_bancaria] NVARCHAR(50) NULL,
	[IBAN] NVARCHAR(34) NULL,
	[BIC] NVARCHAR(11) NULL,
	[id_empresa] INT NULL,
	CONSTRAINT [PK_CentrosTrabajo] PRIMARY KEY ([id_centro])
);

-- Crear tabla Personas
CREATE TABLE [Personas] (
	[id_persona] INT IDENTITY(1,1) NOT NULL,
	[tipoDocumento] NVARCHAR(50) NOT NULL,
	[documento] NVARCHAR(50) NOT NULL,
	[nombre] NVARCHAR(100) NOT NULL,
	[apellido1] NVARCHAR(100) NOT NULL,
	[apellido2] NVARCHAR(100) NULL,
	[telefono] NVARCHAR(20) NULL,
	[correoElectronico] NVARCHAR(100) NULL,
	[NSS] NVARCHAR(20) NULL,
	[es_docente] BIT NOT NULL DEFAULT 0,
	[es_alumno] BIT NOT NULL DEFAULT 0,
	[fecha_nacimiento] DATE NULL,
	[sexo] NVARCHAR(20) NULL,
	[domicilio] NVARCHAR(255) NULL,
	[discapacidad] BIT NOT NULL DEFAULT 0,
	[afectadosTerrorismo] BIT NOT NULL DEFAULT 0,
	[afectadosViolenciaGenero] BIT NOT NULL DEFAULT 0,
	[nivel_estudios] INT NULL,
	[comentarios] NVARCHAR(MAX) NULL,
	CONSTRAINT [PK_Personas] PRIMARY KEY ([id_persona]),
	CONSTRAINT [UQ_Personas_documento] UNIQUE ([documento])
);

-- Crear tabla Grupos
CREATE TABLE [Grupos] (
	[id_grupo] INT IDENTITY(1,1) NOT NULL,
	[estado] NVARCHAR(50) NULL,
	[codigo] NVARCHAR(50) NULL,
	[fecha_inicio] DATE NULL,
	[fecha_fin] DATE NULL,
	[denominacion] NVARCHAR(255) NULL,
	[responsable] NVARCHAR(255) NULL,
	[telefono_responsable] NVARCHAR(20) NULL,
	[observaciones] NVARCHAR(MAX) NULL,
	[centro_cif] NVARCHAR(50) NULL,
	[centro_nombre] NVARCHAR(255) NULL,
	[centro_direccion] NVARCHAR(255) NULL,
	[centro_codPostal] NVARCHAR(20) NULL,
	[centro_localidad] NVARCHAR(100) NULL,
	[lugar_imparticion_cif] NVARCHAR(50) NULL,
	[lugar_imparticion_nombre] NVARCHAR(255) NULL,
	[lugar_imparticion_direccion] NVARCHAR(255) NULL,
	[lugar_imparticion_codPostal] NVARCHAR(20) NULL,
	[lugar_imparticion_localidad] NVARCHAR(100) NULL,
	[horas_totales_presencial_horario] INT NULL,
	[hora_inicio_tramo1_presencial_horario] TIME NULL,
	[hora_fin_tramo1_presencial_horario] TIME NULL,
	[hora_inicio_tramo2_presencial_horario] TIME NULL,
	[hora_fin_tramo2_presencial_horario] TIME NULL,
	[dias_presencial_horario] NVARCHAR(50) NULL,
	[aula_virtual] BIT NOT NULL DEFAULT 0,
	[medio_aula_virtual] NVARCHAR(100) NULL,
	[conexion_aula_virtual] NVARCHAR(100) NULL,
	[contacto_aula_virtual] NVARCHAR(255) NULL,
	[telefono_aula_virtual] NVARCHAR(20) NULL,
	[bimodal_aula_virtual] BIT NOT NULL DEFAULT 0,
	[sin_participantes_en_centro_aula_virtual] BIT NOT NULL DEFAULT 0,
	[sin_docentes_en_centro_aula_virtual] BIT NOT NULL DEFAULT 0,
	[tele_centro_cif] NVARCHAR(50) NULL,
	[tele_centro_nombre] NVARCHAR(255) NULL,
	[tele_centro_direccion] NVARCHAR(255) NULL,
	[tele_centro_codPostal] NVARCHAR(20) NULL,
	[tele_centro_localidad] NVARCHAR(100) NULL,
	[tele_telefono] NVARCHAR(20) NULL,
	[horas_totales_teleformacion] INT NULL,
	[hora_inicio_tramo1_tele] TIME NULL,
	[hora_fin_tramo1_tele] TIME NULL,
	[hora_inicio_tramo2_tele] TIME NULL,
	[hora_fin_tramo2_tele] TIME NULL,
	[dias_tele] NVARCHAR(50) NULL,
	[id_accion] INT NULL,
	[moodle_grupo_id] NVARCHAR(50) NULL,
	[lugar_fecha_diploma] NVARCHAR(255) NULL,
	CONSTRAINT [PK_Grupos] PRIMARY KEY ([id_grupo])
);

-- Crear tabla AlumnosPersonaGrupo
CREATE TABLE [AlumnosPersonaGrupo] (
	[id_alumno_grupo] INT IDENTITY(1,1) NOT NULL,
	[id_persona] INT NOT NULL,
	[id_grupo] INT NOT NULL,
	[id_centro] INT NOT NULL,
	[fecha_inscripcion] DATE NULL,
	[estado_curso] NVARCHAR(50) NULL,
	[progreso_curso] NVARCHAR(100) NULL,
	[diploma] NVARCHAR(50) NULL,
	[jornada_laboral] BIT NOT NULL DEFAULT 0,
	[fijo_discontinuo] BIT NOT NULL DEFAULT 0,
	[categoria_profesional] NVARCHAR(100) NULL,
	[ERTE] BIT NOT NULL DEFAULT 0,
	CONSTRAINT [PK_AlumnosPersonaGrupo] PRIMARY KEY ([id_alumno_grupo])
);

-- Crear tabla DocentesPersonaGrupo
CREATE TABLE [DocentesPersonaGrupo] (
	[id_docente_grupo] INT IDENTITY(1,1) NOT NULL,
	[id_persona] INT NOT NULL,
	[id_grupo] INT NOT NULL,
	[fecha_asignacion] DATE NULL,
	[tutoria] BIT NOT NULL DEFAULT 0,
	[tipotutoria] NVARCHAR(50) NULL,
	[descripcion] NVARCHAR(MAX) NULL,
	[modalidad] NVARCHAR(50) NULL,
	CONSTRAINT [PK_DocentesPersonaGrupo] PRIMARY KEY ([id_docente_grupo])
);

-- Crear tabla CostesGrupo
CREATE TABLE [CostesGrupo] (
	[id_coste] INT IDENTITY(1,1) NOT NULL,
	[id_grupo] INT NOT NULL,
	[cif] NVARCHAR(50) NULL,
	[directos] DECIMAL(10,2) NULL,
	[indirectos] DECIMAL(10,2) NULL,
	[organizacion] DECIMAL(10,2) NULL,
	[salariales] DECIMAL(10,2) NULL,
	[periodos_enero] DECIMAL(10,2) NULL,
	[periodos_febrero] DECIMAL(10,2) NULL,
	[periodos_marzo] DECIMAL(10,2) NULL,
	[periodos_abril] DECIMAL(10,2) NULL,
	[periodos_mayo] DECIMAL(10,2) NULL,
	[periodos_junio] DECIMAL(10,2) NULL,
	[periodos_julio] DECIMAL(10,2) NULL,
	[periodos_agosto] DECIMAL(10,2) NULL,
	[periodos_septiembre] DECIMAL(10,2) NULL,
	[periodos_octubre] DECIMAL(10,2) NULL,
	[periodos_noviembre] DECIMAL(10,2) NULL,
	[periodos_diciembre] DECIMAL(10,2) NULL,
	CONSTRAINT [PK_CostesGrupo] PRIMARY KEY ([id_coste])
);

-- Crear tabla DiasImparticionGrupoPresencial
CREATE TABLE [DiasImparticionGrupoPresencial] (
	[id_dia_pres] INT IDENTITY(1,1) NOT NULL,
	[id_grupo] INT NOT NULL,
	[id_docente] INT NULL,
	[fecha_imparticion] DATE NOT NULL,
	[horario_inicio_tramo1] TIME NULL,
	[horario_fin_tramo1] TIME NULL,
	[horario_inicio_tramo2] TIME NULL,
	[horario_fin_tramo2] TIME NULL,
	CONSTRAINT [PK_DiasImparticionGrupoPresencial] PRIMARY KEY ([id_dia_pres])
);

-- Crear tabla DiasImparticionGrupoTeleformacion
CREATE TABLE [DiasImparticionGrupoTeleformacion] (
	[id_dia_tele] INT IDENTITY(1,1) NOT NULL,
	[id_grupo] INT NOT NULL,
	[id_docente] INT NULL,
	[fecha_imparticion] DATE NOT NULL,
	[horario_inicio_tramo1] TIME NULL,
	[horario_fin_tramo1] TIME NULL,
	[horario_inicio_tramo2] TIME NULL,
	[horario_fin_tramo2] TIME NULL,
	CONSTRAINT [PK_DiasImparticionGrupoTeleformacion] PRIMARY KEY ([id_dia_tele])
);

-- Crear tabla Sesiones
CREATE TABLE [Sesiones] (
	[id_sesion] INT IDENTITY(1,1) NOT NULL,
	[id_dia_tele] INT NULL,
	[id_dia_pres] INT NULL,
	[id_docente] INT NULL,
	[es_manana] BIT NOT NULL DEFAULT 1,
	[horario_inicio] TIME NOT NULL,
	[horario_fin] TIME NOT NULL,
	CONSTRAINT [PK_Sesiones] PRIMARY KEY ([id_sesion])
);

-- Crear tabla Tareas
CREATE TABLE [Tareas] (
	[id_tarea] INT IDENTITY(1,1) NOT NULL,
	[id_grupo] INT NOT NULL,
	[nombre_tarea] NVARCHAR(255) NOT NULL,
	[estado] NVARCHAR(50) NOT NULL DEFAULT 'Pendiente',
	[observaciones] NVARCHAR(MAX) NULL,
	[autor_azure_id] NVARCHAR(255) NOT NULL,
	[responsable_azure_id] NVARCHAR(255) NOT NULL,
	CONSTRAINT [PK_Tareas] PRIMARY KEY ([id_tarea])
);

-- Crear tabla DocumentacionAdjAlumnoPersona
CREATE TABLE [DocumentacionAdjAlumnoPersona] (
	[id_documento] INT IDENTITY(1,1) NOT NULL,
	[id_persona] INT NOT NULL,
	[tipo_documento] NVARCHAR(1000) NOT NULL,
	[nombre_archivo] NVARCHAR(255) NOT NULL,
	[nombre_archivo_blob] NVARCHAR(255) NULL,
	[url_blob] NVARCHAR(500) NOT NULL,
	[fecha_subida] DATE NOT NULL DEFAULT GETDATE(),
	[observaciones] NVARCHAR(MAX) NULL,
	CONSTRAINT [PK_DocumentacionAdjAlumnoPersona] PRIMARY KEY ([id_documento])
);

-- Crear tabla DocumentacionAdjDocentePersona
CREATE TABLE [DocumentacionAdjDocentePersona] (
	[id_documento] INT IDENTITY(1,1) NOT NULL,
	[id_persona] INT NOT NULL,
	[tipo_documento] NVARCHAR(1000) NOT NULL,
	[nombre_archivo] NVARCHAR(255) NOT NULL,
	[nombre_archivo_blob] NVARCHAR(255) NULL,
	[url_blob] NVARCHAR(500) NOT NULL,
	[fecha_subida] DATE NOT NULL DEFAULT GETDATE(),
	[observaciones] NVARCHAR(MAX) NULL,
	CONSTRAINT [PK_DocumentacionAdjDocentePersona] PRIMARY KEY ([id_documento])
);

-- Crear tabla DocumentacionAdjEmpresa
CREATE TABLE [DocumentacionAdjEmpresa] (
	[id_documento] INT IDENTITY(1,1) NOT NULL,
	[id_empresa] INT NOT NULL,
	[tipo_documento] NVARCHAR(100) NOT NULL,
	[nombre_archivo] NVARCHAR(255) NOT NULL,
	[nombre_archivo_blob] NVARCHAR(255) NULL,
	[url_blob] NVARCHAR(500) NOT NULL,
	[fecha_subida] DATE NOT NULL DEFAULT GETDATE(),
	[observaciones] NVARCHAR(MAX) NULL,
	CONSTRAINT [PK_DocumentacionAdjEmpresa] PRIMARY KEY ([id_documento])
);

-- Crear tabla DocumentacionAdjGrupo
CREATE TABLE [DocumentacionAdjGrupo] (
	[id_documento] INT IDENTITY(1,1) NOT NULL,
	[id_grupo] INT NOT NULL,
	[tipo_documento] NVARCHAR(100) NOT NULL,
	[nombre_archivo] NVARCHAR(255) NOT NULL,
	[nombre_archivo_blob] NVARCHAR(255) NULL,
	[url_blob] NVARCHAR(500) NOT NULL,
	[fecha_subida] DATE NOT NULL DEFAULT GETDATE(),
	[observaciones] NVARCHAR(MAX) NULL,
	CONSTRAINT [PK_DocumentacionAdjGrupo] PRIMARY KEY ([id_documento])
);

-- Crear tabla EmailLogs
CREATE TABLE [EmailLogs] (
	[id_email_log] INT IDENTITY(1,1) NOT NULL,
	[id_grupo] INT NULL,
	[id_persona] INT NULL,
	[tipo_envio] NVARCHAR(50) NOT NULL,
	[fecha_envio] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
	[enviado] BIT NOT NULL DEFAULT 1,
	CONSTRAINT [PK_EmailLogs] PRIMARY KEY ([id_email_log])
);

-- Crear índices y claves foráneas
-- Claves foráneas para AccionesFormativas
ALTER TABLE [AccionesFormativas] 
ADD CONSTRAINT [FK_AccionesFormativas_id_area] 
FOREIGN KEY ([id_area]) REFERENCES [AreaProfesional] ([id_area]);

ALTER TABLE [AccionesFormativas] 
ADD CONSTRAINT [FK_AccionesFormativas_id_desglose] 
FOREIGN KEY ([id_desglose]) REFERENCES [DesgloseAreasProfesionales] ([id_desglose]);

ALTER TABLE [AccionesFormativas] 
ADD CONSTRAINT [FK_AccionesFormativas_id_plan] 
FOREIGN KEY ([id_plan]) REFERENCES [Planes] ([id_plan]);

-- Claves foráneas para DesgloseAreasProfesionales
ALTER TABLE [DesgloseAreasProfesionales] 
ADD CONSTRAINT [FK_DesgloseAreasProfesionales_id_area] 
FOREIGN KEY ([id_area]) REFERENCES [AreaProfesional] ([id_area]);

-- Claves foráneas para CentrosTrabajo
ALTER TABLE [CentrosTrabajo] 
ADD CONSTRAINT [FK_CentrosTrabajo_id_empresa] 
FOREIGN KEY ([id_empresa]) REFERENCES [Empresas] ([id_empresa]);

-- Claves foráneas para Grupos
ALTER TABLE [Grupos] 
ADD CONSTRAINT [FK_Grupos_id_accion] 
FOREIGN KEY ([id_accion]) REFERENCES [AccionesFormativas] ([id_accion]);

-- Claves foráneas para AlumnosPersonaGrupo
ALTER TABLE [AlumnosPersonaGrupo] 
ADD CONSTRAINT [FK_AlumnosPersonaGrupo_id_persona] 
FOREIGN KEY ([id_persona]) REFERENCES [Personas] ([id_persona]);

ALTER TABLE [AlumnosPersonaGrupo] 
ADD CONSTRAINT [FK_AlumnosPersonaGrupo_id_grupo] 
FOREIGN KEY ([id_grupo]) REFERENCES [Grupos] ([id_grupo]);

ALTER TABLE [AlumnosPersonaGrupo] 
ADD CONSTRAINT [FK_AlumnosPersonaGrupo_id_centro] 
FOREIGN KEY ([id_centro]) REFERENCES [CentrosTrabajo] ([id_centro]);

-- Claves foráneas para DocentesPersonaGrupo
ALTER TABLE [DocentesPersonaGrupo] 
ADD CONSTRAINT [FK_DocentesPersonaGrupo_id_persona] 
FOREIGN KEY ([id_persona]) REFERENCES [Personas] ([id_persona]);

ALTER TABLE [DocentesPersonaGrupo] 
ADD CONSTRAINT [FK_DocentesPersonaGrupo_id_grupo] 
FOREIGN KEY ([id_grupo]) REFERENCES [Grupos] ([id_grupo]);

-- Claves foráneas para CostesGrupo
ALTER TABLE [CostesGrupo] 
ADD CONSTRAINT [FK_CostesGrupo_id_grupo] 
FOREIGN KEY ([id_grupo]) REFERENCES [Grupos] ([id_grupo]);

-- Claves foráneas para DiasImparticionGrupoPresencial
ALTER TABLE [DiasImparticionGrupoPresencial] 
ADD CONSTRAINT [FK_DiasImparticionGrupoPresencial_id_grupo] 
FOREIGN KEY ([id_grupo]) REFERENCES [Grupos] ([id_grupo]);

ALTER TABLE [DiasImparticionGrupoPresencial] 
ADD CONSTRAINT [FK_DiasImparticionGrupoPresencial_id_docente] 
FOREIGN KEY ([id_docente]) REFERENCES [DocentesPersonaGrupo] ([id_docente_grupo]);

-- Claves foráneas para DiasImparticionGrupoTeleformacion
ALTER TABLE [DiasImparticionGrupoTeleformacion] 
ADD CONSTRAINT [FK_DiasImparticionGrupoTeleformacion_id_grupo] 
FOREIGN KEY ([id_grupo]) REFERENCES [Grupos] ([id_grupo]);

ALTER TABLE [DiasImparticionGrupoTeleformacion] 
ADD CONSTRAINT [FK_DiasImparticionGrupoTeleformacion_id_docente] 
FOREIGN KEY ([id_docente]) REFERENCES [DocentesPersonaGrupo] ([id_docente_grupo]);

-- Claves foráneas para Sesiones
ALTER TABLE [Sesiones] 
ADD CONSTRAINT [FK_Sesiones_id_dia_pres] 
FOREIGN KEY ([id_dia_pres]) REFERENCES [DiasImparticionGrupoPresencial] ([id_dia_pres]);

ALTER TABLE [Sesiones] 
ADD CONSTRAINT [FK_Sesiones_id_dia_tele] 
FOREIGN KEY ([id_dia_tele]) REFERENCES [DiasImparticionGrupoTeleformacion] ([id_dia_tele]);

ALTER TABLE [Sesiones] 
ADD CONSTRAINT [FK_Sesiones_id_docente] 
FOREIGN KEY ([id_docente]) REFERENCES [DocentesPersonaGrupo] ([id_docente_grupo]);

-- Claves foráneas para Tareas
ALTER TABLE [Tareas] 
ADD CONSTRAINT [FK_Tareas_id_grupo] 
FOREIGN KEY ([id_grupo]) REFERENCES [Grupos] ([id_grupo]);

-- Claves foráneas para DocumentacionAdjAlumnoPersona
ALTER TABLE [DocumentacionAdjAlumnoPersona] 
ADD CONSTRAINT [FK_DocumentacionAdjAlumnoPersona_id_persona] 
FOREIGN KEY ([id_persona]) REFERENCES [Personas] ([id_persona]);

-- Claves foráneas para DocumentacionAdjDocentePersona
ALTER TABLE [DocumentacionAdjDocentePersona] 
ADD CONSTRAINT [FK_DocumentacionAdjDocentePersona_id_persona] 
FOREIGN KEY ([id_persona]) REFERENCES [Personas] ([id_persona]);

-- Claves foráneas para DocumentacionAdjEmpresa
ALTER TABLE [DocumentacionAdjEmpresa] 
ADD CONSTRAINT [FK_DocumentacionAdjEmpresa_id_empresa] 
FOREIGN KEY ([id_empresa]) REFERENCES [Empresas] ([id_empresa]);

-- Claves foráneas para DocumentacionAdjGrupo
ALTER TABLE [DocumentacionAdjGrupo] 
ADD CONSTRAINT [FK_DocumentacionAdjGrupo_id_grupo] 
FOREIGN KEY ([id_grupo]) REFERENCES [Grupos] ([id_grupo]);

-- Claves foráneas para EmailLogs
ALTER TABLE [EmailLogs] 
ADD CONSTRAINT [FK_EmailLogs_id_grupo] 
FOREIGN KEY ([id_grupo]) REFERENCES [Grupos] ([id_grupo]);

ALTER TABLE [EmailLogs] 
ADD CONSTRAINT [FK_EmailLogs_id_persona] 
FOREIGN KEY ([id_persona]) REFERENCES [Personas] ([id_persona]);

-- Crear índices para mejorar el rendimiento
CREATE INDEX [IX_AccionesFormativas_id_area] ON [AccionesFormativas] ([id_area]);
CREATE INDEX [IX_AccionesFormativas_id_desglose] ON [AccionesFormativas] ([id_desglose]);
CREATE INDEX [IX_AccionesFormativas_id_plan] ON [AccionesFormativas] ([id_plan]);

CREATE INDEX [IX_AlumnosPersonaGrupo_id_persona] ON [AlumnosPersonaGrupo] ([id_persona]);
CREATE INDEX [IX_AlumnosPersonaGrupo_id_grupo] ON [AlumnosPersonaGrupo] ([id_grupo]);
CREATE INDEX [IX_AlumnosPersonaGrupo_id_centro] ON [AlumnosPersonaGrupo] ([id_centro]);

CREATE INDEX [IX_CentrosTrabajo_id_empresa] ON [CentrosTrabajo] ([id_empresa]);

CREATE INDEX [IX_CostesGrupo_id_grupo] ON [CostesGrupo] ([id_grupo]);

CREATE INDEX [IX_DesgloseAreasProfesionales_id_area] ON [DesgloseAreasProfesionales] ([id_area]);

CREATE INDEX [IX_DiasImparticionGrupoPresencial_id_grupo] ON [DiasImparticionGrupoPresencial] ([id_grupo]);
CREATE INDEX [IX_DiasImparticionGrupoPresencial_id_docente] ON [DiasImparticionGrupoPresencial] ([id_docente]);

CREATE INDEX [IX_DiasImparticionGrupoTeleformacion_id_grupo] ON [DiasImparticionGrupoTeleformacion] ([id_grupo]);
CREATE INDEX [IX_DiasImparticionGrupoTeleformacion_id_docente] ON [DiasImparticionGrupoTeleformacion] ([id_docente]);

CREATE INDEX [IX_DocentesPersonaGrupo_id_grupo] ON [DocentesPersonaGrupo] ([id_grupo]);
CREATE INDEX [IX_DocentesPersonaGrupo_id_persona] ON [DocentesPersonaGrupo] ([id_persona]);

CREATE INDEX [IX_DocumentacionAdjAlumnoPersona_id_persona] ON [DocumentacionAdjAlumnoPersona] ([id_persona]);
CREATE INDEX [IX_DocumentacionAdjDocentePersona_id_persona] ON [DocumentacionAdjDocentePersona] ([id_persona]);
CREATE INDEX [IX_DocumentacionAdjEmpresa_id_empresa] ON [DocumentacionAdjEmpresa] ([id_empresa]);
CREATE INDEX [IX_DocumentacionAdjGrupo_id_grupo] ON [DocumentacionAdjGrupo] ([id_grupo]);

CREATE INDEX [IX_EmailLogs_id_grupo] ON [EmailLogs] ([id_grupo]);
CREATE INDEX [IX_EmailLogs_id_persona] ON [EmailLogs] ([id_persona]);

CREATE INDEX [IX_Grupos_id_accion] ON [Grupos] ([id_accion]);

CREATE INDEX [IX_Sesiones_id_dia_pres] ON [Sesiones] ([id_dia_pres]);
CREATE INDEX [IX_Sesiones_id_dia_tele] ON [Sesiones] ([id_dia_tele]);
CREATE INDEX [IX_Sesiones_id_docente] ON [Sesiones] ([id_docente]);

CREATE INDEX [IX_Tareas_id_grupo] ON [Tareas] ([id_grupo]);