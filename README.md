# Olimpiadas Peru

Sistema web para la gestion de olimpiadas internas de instituciones educativas. La solucion permite administrar instituciones, deportes, equipos, participantes, inscripciones, sorteos, programacion de contiendas, resultados, estadisticas, usuarios, roles y accesos por modulo.

El proyecto esta orientado al segundo entregable APF2: ambiente levantado, trabajo versionado con Git, autenticacion segura, conexion a base de datos sin credenciales hardcodeadas y funcionalidades principales implementadas para validar al menos el 30% de los procesos.

## Arquitectura

```text
OLIMPIADASPERU/
├── backend/    API REST con Spring Boot
└── frontend/   Panel administrativo con Next.js
```

## Tecnologias

| Capa | Tecnologia |
| --- | --- |
| Backend | Java 21, Spring Boot 3.3.5, Spring Security, JWT, Spring Data JPA |
| Base de datos | PostgreSQL, H2 para pruebas |
| Documentacion API | Springdoc OpenAPI / Swagger UI |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| UI | SweetAlert2, Lucide React |
| Control de versiones | Git / GitHub |

## Modulos Implementados

- Autenticacion con JWT y refresh token.
- Usuarios, roles, modulos y permisos por rol.
- Instituciones participantes.
- Deportes obligatorios: futbol varones, basquet varones, voley damas y ping pong mixto.
- Equipos con pais asignado.
- Participantes por equipo.
- Inscripciones por deporte.
- Sorteos y generacion de grupos.
- Programacion de partidos con fecha, hora, sede y estado.
- Resultados por contienda.
- Estadisticas y resumen para dashboard.
- Auditoria de operaciones relevantes.

## Seguridad

- Las contrasenas de usuarios se almacenan encriptadas con BCrypt.
- La autenticacion se realiza mediante JWT.
- Los endpoints protegidos requieren token Bearer.
- El acceso a modulos se valida por rol en backend y tambien se refleja en el frontend.
- La configuracion sensible se toma desde variables de entorno.
- El archivo `.env` local no se versiona.
- Se incluye `backend/.env.example` como plantilla segura.

## Variables De Entorno Backend

El backend usa `backend/.env` para desarrollo local. La plantilla disponible es:

```text
backend/.env.example
```

Variables principales:

```env
DB_URL=jdbc:postgresql://localhost:5432/olimpiadas_peru
DB_USERNAME=postgres
DB_PASSWORD=change_me
DB_DRIVER=org.postgresql.Driver

JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect

SERVER_PORT=8080
SERVER_CONTEXT_PATH=/olimpiadas

JWT_SECRET=change-this-secret-for-a-long-secure-random-value
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

APP_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=change_me@example.com
MAIL_PASSWORD=change_me
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS_ENABLE=true

APP_FRONTEND_RESET_PASSWORD_URL=http://localhost:3000/reset-password
PASSWORD_RESET_EXPIRATION_MINUTES=30
```

## Ejecucion Backend

Requisitos:

- JDK 21.
- PostgreSQL 14 o superior.
- Maven Wrapper incluido en el proyecto.

Desde la carpeta `backend`:

```bash
./mvnw spring-boot:run
```

En Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

Base URL local:

```text
http://localhost:8080/olimpiadas
```

Swagger UI:

```text
http://localhost:8080/olimpiadas/swagger-ui/index.html
```

Ejecutar pruebas:

```powershell
.\mvnw.cmd test
```

## Ejecucion Frontend

Requisitos:

- Node.js 20 o superior.
- Backend ejecutandose en `http://localhost:8080/olimpiadas`.

Desde la carpeta `frontend`:

```bash
npm install
npm run dev
```

URL local:

```text
http://localhost:3000
```

Variable opcional para la API:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/olimpiadas
```

Compilar frontend:

```bash
npm run build
```

## Credenciales De Prueba

La data inicial del backend incluye usuarios de prueba:

```text
Administrador
Correo: admin@olimpiadasperu.pe
Clave: Admin123*

Coordinador
Correo: coordinador@olimpiadasperu.pe
Clave: Admin123*

Consulta
Correo: consulta@olimpiadasperu.pe
Clave: Admin123*
```

## Endpoints Principales

```text
POST /api/auth/login
POST /api/auth/refresh
GET  /api/dashboard
GET  /api/instituciones
GET  /api/deportes
GET  /api/equipos
GET  /api/participantes
GET  /api/inscripciones
GET  /api/sorteos
GET  /api/programaciones
GET  /api/resultados
GET  /api/estadisticas
GET  /api/usuarios
GET  /api/roles
GET  /api/modulos
GET  /api/auditoria
```

## Estado Del Proyecto

El sistema ya cuenta con la base funcional para el avance APF2:

- Ambiente backend y frontend levantado.
- Repositorio versionado con Git.
- Login seguro con JWT.
- Passwords encriptados.
- Conexion a PostgreSQL mediante variables de entorno.
- CRUD principales conectados a base de datos.
- Permisos por rol y modulo.
- Dashboard con metricas reales.
- Pruebas automatizadas en backend.

## Autores

- Denis Jamil Tineo Huancas
