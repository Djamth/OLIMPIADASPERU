# Olimpiadas Peru API

Backend REST para la gestion de olimpiadas deportivas escolares. El proyecto esta construido con Spring Boot, JWT, PostgreSQL .

## Resumen

La API cubre los modulos principales del sistema:

- autenticacion y autorizacion con JWT
- usuarios, roles y modulos
- instituciones
- deportes
- equipos
- participantes
- inscripciones
- sorteos y grupos
- programacion de partidos
- resultados
- estadisticas

Base URL local:

```text
http://localhost:8080/olimpiadas
```

Documentacion API:

```text
http://localhost:8080/olimpiadas/swagger-ui/index.html
```

## Tecnologias

- Java 21
- Spring Boot 3.3.5
- Spring Security + JWT
- Spring Data JPA
- Flyway
- PostgreSQL
- H2 para pruebas
- Springdoc OpenAPI
- Maven

## Requisitos

- JDK 21
- Maven 3.9+
- PostgreSQL 14+ recomendado

## Configuracion

La aplicacion usa variables de entorno para evitar credenciales hardcodeadas.

Variables soportadas:

```properties
DB_URL=jdbc:postgresql://localhost:5432/olimpiadas_peru
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DRIVER=org.postgresql.Driver
JPA_DDL_AUTO=update
FLYWAY_ENABLED=true
DEMO_DATA_ENABLED=true
JWT_SECRET=clave-secreta-de-al-menos-32-caracteres
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000
APP_CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Flyway ejecuta las migraciones ubicadas en `src/main/resources/db/migration`. Cuando
`DEMO_DATA_ENABLED=true`, la aplicacion carga al final la semilla idempotente
`src/main/resources/demo-data.sql`. En produccion se recomienda desactivar esa semilla.

## Ejecucion local

Desde la carpeta `backend`:

```bash
mvn spring-boot:run
```

Para ejecutar pruebas:

```bash
mvn test
```

## Seguridad

- la API usa JWT almacenado en cookies `HttpOnly`
- login, renovacion y recuperacion de contrasena son publicos
- el resto de endpoints requiere JWT
- las contrasenas se almacenan con `BCrypt`

El navegador debe enviar las credenciales con `credentials: "include"`.

## Flujo de autenticacion

### Login

`POST /api/auth/login`

Request:

```json
{
  "email": "admin@olimpiadasperu.pe",
  "password": "Admin123*"
}
```

Respuesta esperada:

```json
{
  "id": 1,
  "nombre": "Administrador",
  "email": "admin@olimpiadasperu.pe",
  "rolId": 1,
  "rolNombre": "administrador",
  "estado": "ACTIVO",
  "modulos": [
    {
      "id": 1,
      "nombre": "Usuarios",
      "ruta": "/usuarios",
      "icono": "users"
    }
  ],
  "expiresIn": 900000,
  "tokenType": "Cookie"
}
```

### Endpoints publicos de autenticacion

- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Endpoints autenticados de sesion

- `POST /api/auth/logout`
- `GET /api/auth/me`

## Endpoints principales

Todos estos endpoints usan como prefijo real:

```text
/olimpiadas
```

Por ejemplo, `GET /api/deportes` realmente se consume como `GET /olimpiadas/api/deportes`.

### Usuarios, roles y modulos

#### Usuarios

- `POST /api/usuarios`
- `GET /api/usuarios`
- `GET /api/usuarios/{id}`
- `GET /api/usuarios/email/{email}`
- `PUT /api/usuarios/{id}`
- `PUT /api/usuarios/{id}/desactivar`
- `DELETE /api/usuarios/{id}`

#### Roles

- `POST /api/roles`
- `GET /api/roles`
- `GET /api/roles/{id}`
- `GET /api/roles/{id}/modulos`
- `PUT /api/roles/{id}`
- `PUT /api/roles/{id}/modulos`
- `POST /api/roles/{rolId}/modulos/{moduloId}`
- `DELETE /api/roles/{rolId}/modulos/{moduloId}`
- `DELETE /api/roles/{id}`

#### Modulos

- `POST /api/modulos`
- `GET /api/modulos`
- `GET /api/modulos/{id}`
- `PUT /api/modulos/{id}`
- `DELETE /api/modulos/{id}`

### Instituciones

- `GET /api/instituciones`
- `GET /api/instituciones/{id}`
- `POST /api/instituciones`
- `PUT /api/instituciones/{id}`
- `DELETE /api/instituciones/{id}`

### Deportes

- `GET /api/deportes`
- `GET /api/deportes/{id}`
- `POST /api/deportes`
- `PUT /api/deportes/{id}`
- `DELETE /api/deportes/{id}`

### Equipos

- `GET /api/equipos`
- `GET /api/equipos/{id}`
- `POST /api/equipos`
- `PUT /api/equipos/{id}`
- `DELETE /api/equipos/{id}`

### Participantes

- `GET /api/participantes`
- `GET /api/participantes/{id}`
- `POST /api/participantes`
- `PUT /api/participantes/{id}`
- `DELETE /api/participantes/{id}`

### Inscripciones

- `GET /api/inscripciones`
- `GET /api/inscripciones/{id}`
- `POST /api/inscripciones`
- `PUT /api/inscripciones/{id}`
- `DELETE /api/inscripciones/{id}`

Ejemplo de request:

```json
{
  "equipoId": 1,
  "deporteId": 1,
  "estado": "CONFIRMADA",
  "fechaInscripcion": "2026-05-07"
}
```

### Sorteos

- `POST /api/sorteos/deporte/{deporteId}/grupos`
- `GET /api/sorteos/deporte/{deporteId}/grupos`

### Programacion de partidos

- `GET /api/programaciones`
- `GET /api/programaciones/{id}`
- `POST /api/programaciones`
- `PUT /api/programaciones/{id}`
- `DELETE /api/programaciones/{id}`

Ejemplo de request:

```json
{
  "grupoId": 1,
  "deporteId": 1,
  "equipoLocalId": 1,
  "equipoVisitanteId": 2,
  "fechaHora": "2026-05-10T09:00:00",
  "sede": "Cancha Principal",
  "estado": "PROGRAMADO"
}
```

### Resultados

- `GET /api/resultados`
- `GET /api/resultados/{id}`
- `POST /api/resultados`
- `PUT /api/resultados/{id}`
- `DELETE /api/resultados/{id}`

Ejemplo de request:

```json
{
  "partidoId": 1,
  "puntajeLocal": 3,
  "puntajeVisitante": 1,
  "observaciones": "Partido intenso",
  "anotaciones": [
    {
      "participanteId": 10,
      "cantidad": 2
    },
    {
      "participanteId": 11,
      "cantidad": 1
    }
  ]
}
```

### Estadisticas

- `GET /api/estadisticas/deporte/{deporteId}/goleadores`
- `GET /api/estadisticas/deporte/{deporteId}/ranking`

## Reglas de negocio implementadas

### Reglas por deporte

La API ya aplica validaciones obligatorias por deporte:

- `FUTBOL`: 11 jugadores, equipos masculinos
- `BASQUET`: 5 jugadores, equipos masculinos
- `VOLEY`: 6 jugadores, equipos femeninos
- `PING_PONG`: 1 jugador, equipos mixtos

### Reglas de inscripcion

- un equipo no puede inscribirse dos veces en el mismo deporte
- una inscripcion `CONFIRMADA` exige que el equipo tenga el minimo de participantes del deporte
- el genero del equipo debe ser compatible con el deporte

### Reglas de sorteo

- el sorteo solo considera inscripciones `CONFIRMADA`
- se requieren al menos dos equipos confirmados
- cada equipo sorteado debe cumplir el minimo de participantes

### Reglas de programacion

- un equipo no puede jugar contra si mismo
- ambos equipos deben tener inscripcion `CONFIRMADA` en el deporte
- ambos equipos deben cumplir el minimo de participantes del deporte
- si se informa `grupoId`, ambos equipos deben pertenecer a ese grupo
- el grupo debe pertenecer al mismo deporte del partido
- la fecha del partido debe ser futura

### Reglas de resultados

- un partido solo puede tener un resultado asociado
- las anotaciones se registran por participante real
- los participantes anotados deben pertenecer a uno de los equipos del partido

## Codigos de respuesta esperados

- `200 OK`: consulta o actualizacion exitosa
- `201 Created`: recurso creado
- `400 Bad Request`: validacion o regla de negocio incumplida
- `401 Unauthorized`: no autenticado
- `404 Not Found`: recurso no encontrado

Ejemplo de error:

```json
{
  "mensaje": "No autenticado"
}
```

## Pruebas automatizadas

Actualmente existen pruebas para:

- autenticacion
- reglas por deporte
- participantes
- inscripciones
- sorteos
- programacion
- resultados

Se ejecutan con H2 en memoria para no depender de PostgreSQL durante testing.

## Notas para frontend

- usar siempre la base URL `http://localhost:8080/olimpiadas`
- guardar `accessToken` y enviarlo como `Bearer`
- usar `refreshToken` para renovar sesion
- los formularios de inscripcion, sorteo y programacion deben contemplar las reglas de negocio listadas arriba
- para registrar resultados, el frontend debe enviar participantes reales en `anotaciones`

## Estado actual

- autenticacion operativa
- CRUD principales implementados
- validaciones de negocio clave activas
- pruebas automatizadas pasando


## Pendiente :
- Implementacion de websocket para notificaciones en tiempo real
- Implementacion de notificaciones por email para eventos importantes
