# 📊 Documentación - Recreación de Base de Datos

Este documento explica cómo recrear completamente la base de datos desde cero, incluyendo la eliminación de datos existentes y la recreación con el nuevo esquema.

## 🚨 Advertencia Importante

**⚠️ ESTE PROCESO ELIMINARÁ TODOS LOS DATOS EXISTENTES**

Este procedimiento borrará completamente la base de datos actual y todos sus datos. Asegúrate de hacer una copia de seguridad si necesitas conservar información importante.

## 📋 Prerrequisitos

- Docker y Docker Compose instalados
- Acceso al directorio `apps/backend`
- Terminal o PowerShell

## 🔄 Proceso de Recreación

### 1. Detener y Eliminar Contenedores

```bash
# Navegar al directorio del backend
cd apps/backend

# Detener contenedores y eliminar volúmenes (esto borra todos los datos)
docker-compose down -v
```

### 2. Recrear la Base de Datos

```bash
# Levantar los contenedores con la base de datos limpia
docker-compose up -d
```

### 3. Esperar Inicialización

```bash
# Esperar que SQL Server se inicie completamente (10 segundos)
timeout /t 10
```

### 4. Poblar la Base de Datos

```bash
# Ejecutar el seed para crear datos de prueba
docker exec praxis-backend node seed.js
```

## ✅ Verificación

### Verificar Estado de Contenedores

```bash
# Verificar que los contenedores estén ejecutándose
docker-compose ps
```

### Probar Endpoints

```bash
# Verificar que el backend esté funcionando
curl http://localhost:3000/api/health

# Probar las nuevas rutas de documentación
curl http://localhost:3000/api/documentacion-alumno-persona
curl http://localhost:3000/api/documentacion-docente-persona
```

## 📊 Datos Creados por el Seed

El proceso de seed creará automáticamente:

- **3 áreas profesionales**
- **3 desgloses de áreas**
- **2 planes**
- **3 acciones formativas**
- **2 empresas**
- **2 centros de trabajo**
- **4 personas**
- **2 grupos**
- **2 alumnos en grupos**
- **2 docentes en grupos**
- **1 documento de alumno** (relacionado directamente con persona)
- **1 documento de docente** (relacionado directamente con persona)
- **1 documento de empresa**
- **2 tareas**

## 🔧 Comandos Útiles

### Ver Logs de Contenedores

```bash
# Ver logs del backend
docker-compose logs backend

# Ver logs de SQL Server
docker-compose logs sqlserver
```

### Acceder a la Base de Datos

```bash
# Conectar a SQL Server desde el contenedor
docker exec -it praxis-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd'
```

### Reiniciar Solo el Backend

```bash
# Reiniciar solo el contenedor del backend
docker-compose restart backend
```

## 🆕 Cambios en el Esquema

### Nuevas Tablas de Documentación

- **`DocumentacionAdjAlumnoPersona`**: Documentación de alumnos relacionada directamente con personas
- **`DocumentacionAdjDocentePersona`**: Documentación de docentes relacionada directamente con personas

### Nuevas Rutas API

- **`GET /api/documentacion-alumno-persona`**: Obtener documentación de alumnos
- **`GET /api/documentacion-docente-persona`**: Obtener documentación de docentes

### Cambios en Relaciones

- La documentación ahora se relaciona directamente con la tabla `Personas` usando `id_persona`
- Se eliminó la dependencia de grupos para la documentación adjunta

## 🐛 Solución de Problemas

### Error: "service backend is not running"

```bash
# Verificar estado de contenedores
docker-compose ps

# Si el backend no está ejecutándose, reiniciar
docker-compose restart backend
```

### Error de Conexión a Base de Datos

```bash
# Verificar que SQL Server esté ejecutándose
docker-compose logs sqlserver

# Reiniciar SQL Server si es necesario
docker-compose restart sqlserver
```

### Limpiar Todo Completamente

```bash
# Detener y eliminar todo (contenedores, volúmenes, redes)
docker-compose down -v --remove-orphans

# Eliminar imágenes si es necesario
docker-compose down --rmi all -v --remove-orphans
```

## 📝 Notas Importantes

1. **Backup**: Siempre haz una copia de seguridad antes de recrear la base de datos
2. **Tiempo de Inicialización**: SQL Server puede tardar unos segundos en estar completamente disponible
3. **Puertos**: Asegúrate de que los puertos 3000 (backend) y 1433 (SQL Server) estén disponibles
4. **Variables de Entorno**: Verifica que las variables de entorno estén configuradas correctamente

## 🔗 Enlaces Útiles

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [SQL Server en Docker](https://docs.microsoft.com/en-us/sql/linux/sql-server-linux-docker-container-deployment)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**Última actualización**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
