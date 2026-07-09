# Olimpiadas Perú API

Backend REST para la gestión de olimpiadas deportivas internas. La API cubre autenticación, seguridad por roles, gestión institucional, asignación de países, equipos, participantes, inscripciones, sorteos, programación, resultados, estadísticas, reportes y notificaciones.

## Base URL

```text
http://localhost:8080/olimpiadas
```

Swagger UI:

```text
http://localhost:8080/olimpiadas/swagger-ui/index.html
```

## Tecnologías

- Java 21
- Spring Boot 3.3.5
- Spring Security
- JWT y refresh token
- Spring Data JPA
- Flyway
- PostgreSQL
- H2 para pruebas
- Springdoc OpenAPI
- Maven
- PDF/Excel para reportes

## Configuración

La aplicación usa variables de entorno para evitar credenciales hardcodeadas. Crear `backend/.env` a partir de `backend/.env.example`.

Variables principales:

```properties
DB_URL=jdbc:postgresql://localhost:5432/olimpiadas_peru
DB_USERNAME=postgres
DB_PASSWORD=change_me
DB_DRIVER=org.postgresql.Driver

JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect
FLYWAY_ENABLED=true
DEMO_DATA_ENABLED=true

SERVER_PORT=8080
SERVER_CONTEXT_PATH=/olimpiadas

JWT_SECRET=change-this-secret-for-a-long-secure-random-value
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

APP_CORS_ALLOWED_ORIGINS=http://localhost:3000

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=change_me@example.com
MAIL_PASSWORD=change_me
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS_ENABLE=true

APP_FRONTEND_RESET_PASSWORD_URL=http://localhost:3000/reset-password
PASSWORD_RESET_EXPIRATION_MINUTES=30
```

## Data Demo

La semilla de desarrollo está en:

```text
src/main/resources/demo-data.sql
```

Con `DEMO_DATA_ENABLED=true`, al iniciar el backend se limpian y recargan los datos demo. Esto es útil para exposiciones y pruebas del flujo completo.

La semilla actual incluye:

- 3 instituciones.
- 1 evento.
- 5 categorías con país asignado.
- 8 países con colores y código de bandera.
- 4 deportes obligatorios.
- 20 equipos.
- 120 participantes.
- 20 inscripciones confirmadas.
- 8 grupos.
- 10 partidos.
- 6 resultados.
- 21 anotaciones individuales.
- Usuarios, roles, módulos y acciones listos para probar permisos.

Para conservar datos manuales:

```properties
DEMO_DATA_ENABLED=false
```

## Ejecución Local

Desde `backend`:

```bash
mvn spring-boot:run
```

Con Maven Wrapper en Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Ejecutar pruebas:

```bash
mvn test
```

## Seguridad

- Contraseñas almacenadas con BCrypt.
- Autenticación con JWT.
- Renovación de sesión con refresh token.
- Soporte de cookies `HttpOnly`.
- Endpoints protegidos por autenticación.
- Permisos por rol, módulo y acción en backend.
- Control para evitar que el administrador se desactive a sí mismo.
- Recuperación de contraseña con código temporal.
- Rate limit para login y recuperación de contraseña.

### RBAC Con Permisos Funcionales

La API implementa un modelo RBAC granular:

```text
usuarios
roles
modulos
acciones
rol_modulos
rol_modulo_acciones
```

- `roles` agrupa permisos por perfil.
- `modulos` representa pantallas o áreas funcionales y soporta submódulos con `modulo_padre_id`.
- `acciones` contiene permisos atómicos: `VER`, `CREAR`, `EDITAR`, `ELIMINAR`, `EXPORTAR` y acciones personalizadas administrables.
- `rol_modulo_acciones` indica qué acción puede ejecutar un rol sobre cada módulo.

El endpoint de login devuelve los módulos autorizados y sus acciones. Para compatibilidad con el frontend, también expone banderas como `puedeVer`, `puedeCrear`, `puedeEditar`, `puedeEliminar` y `puedeExportar`.

Los cambios de permisos por rol se registran en auditoría con detalle de estado anterior y nuevo. Esto permite sustentar quién modificó accesos, cuándo y sobre qué perfil.

## Credenciales Demo

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

## Flujo De Autenticación

### Login

`POST /api/auth/login`

Request:

```json
{
  "email": "admin@olimpiadasperu.pe",
  "password": "Admin123*"
}
```

Respuesta en modo cookie:

```json
{
  "id": 1,
  "nombre": "Administrador Olimpiadas",
  "email": "admin@olimpiadasperu.pe",
  "rolId": 1,
  "rolNombre": "administrador",
  "institucionId": 1,
  "institucionNombre": "Colegio San José",
  "modulos": [],
  "expiresIn": 900000,
  "tokenType": "Cookie"
}
```

Si se requiere token en la respuesta, enviar header:

```text
X-Auth-Mode: bearer
```

### Endpoints públicos de autenticación

- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Endpoints autenticados de sesión

- `POST /api/auth/logout`
- `GET /api/auth/me`

## Endpoints Principales

Todos los endpoints usan el prefijo real `/olimpiadas`.

### Seguridad

- `GET /api/usuarios`
- `POST /api/usuarios`
- `PUT /api/usuarios/{id}`
- `PUT /api/usuarios/{id}/estado`
- `DELETE /api/usuarios/{id}`
- `GET /api/roles`
- `PUT /api/roles/{id}/modulos`
- `GET /api/modulos`
- `GET /api/acciones`
- `POST /api/acciones`
- `PUT /api/acciones/{id}`
- `DELETE /api/acciones/{id}`
- `GET /api/auditoria`

### Institucional

- `GET /api/instituciones`
- `POST /api/instituciones`
- `PUT /api/instituciones/{id}`
- `DELETE /api/instituciones/{id}`
- `GET /api/paises`
- `POST /api/paises`
- `GET /api/eventos`
- `POST /api/eventos`
- `GET /api/categorias-evento`
- `POST /api/categorias-evento`

### Gestión Deportiva

- `GET /api/deportes`
- `GET /api/equipos`
- `GET /api/participantes`
- `GET /api/inscripciones`
- `GET /api/sorteos`
- `GET /api/programaciones`
- `GET /api/resultados`
- `GET /api/estadisticas`

### Dashboard y Portal Público

- `GET /api/dashboard/resumen`
- `GET /api/public/dashboard`

### Reportes

- Ranking por país.
- Medallero.
- Participantes por institución.
- Fixture completo.
- Reporte ejecutivo en PDF.
- Reporte ejecutivo en Excel.

## Reglas De Negocio

### Deportes obligatorios

- `FUTBOL`: equipos masculinos, 11 participantes mínimos, control de goles.
- `BASQUET`: equipos masculinos, 5 participantes mínimos, control de encestadores.
- `VOLEY`: equipos femeninos, 6 participantes mínimos, control por sets.
- `PING_PONG`: equipos mixtos, 1 participante mínimo, control por sets/puntos.

### Institución, evento y países

- Una institución puede crear eventos.
- Cada evento puede tener categorías.
- Cada categoría recibe un país representativo.
- No se permite repetir país dentro del mismo evento.
- El país incluye bandera, colores y dato cultural.

### Inscripciones

- Un equipo no puede inscribirse dos veces en el mismo deporte/evento.
- Una inscripción confirmada exige participantes suficientes.
- El género del equipo debe ser compatible con el deporte.

### Sorteos

- Solo participan inscripciones `CONFIRMADA`.
- Se requieren al menos dos equipos confirmados.
- Los equipos se distribuyen en grupos por deporte.

### Programación

- Un equipo no puede jugar contra sí mismo.
- Ambos equipos deben pertenecer al deporte indicado.
- Si se indica grupo, ambos equipos deben pertenecer a ese grupo.
- La fecha del partido debe ser válida.

### Resultados

- Un partido solo puede tener un resultado asociado.
- Las anotaciones se registran por participante real.
- Los participantes anotados deben pertenecer a uno de los equipos del partido.

## Ejemplo De Resultado

```json
{
  "partidoId": 1001,
  "puntajeLocal": 3,
  "puntajeVisitante": 1,
  "observaciones": "Brasil abrió el torneo con alta presión ofensiva.",
  "anotaciones": [
    {
      "participanteId": 10101,
      "cantidad": 2
    },
    {
      "participanteId": 10102,
      "cantidad": 1
    }
  ]
}
```

## Notificaciones

El backend contempla envío de correos para eventos importantes:

- Inscripción confirmada.
- Partido programado.
- Cambio o reprogramación de horario.
- Resultado registrado.
- Recuperación de contraseña.

## Pruebas Automatizadas

Las pruebas se ejecutan con H2 en memoria:

```bash
mvn test
```

Cobertura funcional:

- Autenticación.
- Refresh token y sesión.
- Reglas por deporte.
- Participantes.
- Inscripciones.
- Sorteos.
- Programación.
- Resultados.
- Dashboard.
- Reportes.

## Estado Actual

- API funcional para el flujo principal de Olimpiadas Perú.
- CRUD principales implementados.
- Permisos de backend por rol, módulo y acción.
- Data demo limpia y alineada al negocio.
- Reportes ejecutivos disponibles.
- Pruebas automatizadas pasando.
