# 🌱 Seed de Base de Datos - Praxis

Este archivo contiene datos de ejemplo para poblar la base de datos de Praxis con información realista y coherente.

## 📋 Datos Incluidos

### 🏢 Entidades Principales
- **3 Áreas Profesionales**: TIC, Administración, Comercio
- **3 Desgloses de Áreas**: Desarrollo Web, Administración de Sistemas, Gestión Administrativa
- **2 Planes**: Plan de Formación Digital 2024, Plan de Competencias Digitales
- **3 Acciones Formativas**: Desarrollo Web, Administración Linux, Gestión Administrativa

### 👥 Personas y Organizaciones
- **2 Empresas**: Tecnología Avanzada S.L., Servicios Administrativos del Sur S.A.
- **2 Centros de Trabajo**: Sede Central Madrid, Oficina Sevilla
- **4 Personas**: 2 docentes, 2 alumnos
- **2 Grupos**: Grupo Desarrollo Web, Grupo Administración Linux

### 📚 Relaciones y Documentación
- **2 Alumnos en Grupos**: Asignaciones de alumnos a grupos
- **2 Docentes en Grupos**: Asignaciones de docentes a grupos
- **3 Documentos**: NIF, Título Universitario, Certificado de Empresa
- **2 Tareas**: Tareas de revisión y validación

## 🚀 Cómo Ejecutar el Seed

### Opción 1: Desde el Host (Recomendado)
```bash
# Asegúrate de que los contenedores estén ejecutándose
docker-compose up -d

# Ejecuta el seed
npm run db:seed
```

### Opción 2: Desde dentro del Contenedor
```bash
# Entra al contenedor del backend
docker-compose exec praxis-backend bash

# Ejecuta el seed
npm run db:seed
```

## ⚠️ Importante

- **El seed elimina todos los datos existentes** antes de insertar los nuevos
- **Ejecuta solo en entornos de desarrollo** o cuando quieras resetear la base de datos
- **Los datos son coherentes** y respetan todas las relaciones entre tablas

## 🔄 Reiniciar la Base de Datos

Si quieres empezar desde cero:

```bash
# Detener contenedores
docker-compose down

# Eliminar volúmenes (esto borra la base de datos)
docker-compose down -v

# Levantar de nuevo
docker-compose up -d

# Ejecutar el seed
npm run db:seed
```

## 📊 Verificar los Datos

Puedes verificar que los datos se insertaron correctamente:

```bash
# Abrir Prisma Studio
npm run db:studio
```

O consultar directamente la API:

```bash
# Ver todos los planes
curl http://localhost:3000/api/planes

# Ver todas las personas
curl http://localhost:3000/api/personas

# Ver todas las empresas
curl http://localhost:3000/api/empresas
```

## 🎯 Datos de Ejemplo Incluidos

### Planes
- **EXP-2024-001**: Plan de Formación Digital 2024 (Concedido)
- **EXP-2024-002**: Plan de Competencias Digitales (Solicitado)

### Acciones Formativas
- **AF-001-2024**: Desarrollo Web con React y Node.js (Mixta)
- **AF-002-2024**: Administración de Sistemas Linux (Presencial)
- **AF-003-2024**: Gestión Administrativa Empresarial (Teleformación)

### Empresas
- **Tecnología Avanzada S.L.** (CIF: B12345678) - Madrid
- **Servicios Administrativos del Sur S.A.** (CIF: A87654321) - Sevilla

### Personas
- **Juan Pérez García** - Docente de Desarrollo Web
- **María González López** - Docente de Administración de Sistemas
- **Carlos Ruiz Martín** - Alumno de Desarrollo Web
- **Laura Sánchez Fernández** - Alumna de Administración

## 🔧 Personalizar el Seed

Si quieres modificar los datos de ejemplo, edita el archivo `seed.js` y:

1. Modifica los datos en las secciones correspondientes
2. Ejecuta `npm run db:seed` para aplicar los cambios
3. Los datos existentes se eliminarán y se insertarán los nuevos

---

**¡Listo!** 🎉 Tu base de datos estará poblada con datos de ejemplo realistas y coherentes.
