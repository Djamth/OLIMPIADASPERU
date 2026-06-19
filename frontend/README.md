# Frontend - Olimpiadas Perú

Frontend del sistema **Olimpiadas Perú**, construido con **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, **Axios**, **SweetAlert2** y **Lucide React**.

La aplicación incluye un portal público deportivo y un panel administrativo para gestionar instituciones, países, eventos, categorías, deportes, equipos, participantes, inscripciones, sorteos, programación, resultados, estadísticas, reportes, usuarios y perfiles con permisos por módulo.

## Requisitos

- Node.js 20 o superior.
- Backend Spring Boot ejecutándose.
- PostgreSQL poblado con la semilla demo del backend.

## Instalación

Desde la carpeta `frontend`:

```bash
npm install
```

## Configuración

La URL base del backend se toma desde:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/olimpiadas
```

Si no se define, la aplicación usa por defecto:

```text
http://localhost:8080/olimpiadas
```

Se puede crear un archivo `.env.local` en `frontend`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/olimpiadas
```

## Ejecutar En Desarrollo

```bash
npm run dev
```

URL local:

```text
http://localhost:3000
```

## Compilar Producción

```bash
npm run build
npm run start
```

## Credenciales De Prueba

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

## Rutas Principales

| Ruta | Descripción |
| --- | --- |
| `/` | Portal público con hero deportivo, próximos encuentros y estadísticas |
| `/login` | Inicio de sesión administrativo |
| `/recuperar-password` | Solicitud de recuperación de contraseña |
| `/reset-password` | Registro de nueva contraseña con código |
| `/dashboard` | Resumen general conectado al backend |
| `/instituciones` | CRUD de instituciones |
| `/paises` | Catálogo de países con bandera y colores |
| `/eventos` | Gestión de eventos por institución |
| `/deportes` | CRUD de deportes y reglas base |
| `/equipos` | CRUD de equipos por categoría/deporte |
| `/participantes` | Participantes agrupados por equipo |
| `/inscripciones` | Inscripción de equipos por deporte y filtro por deporte |
| `/sorteos` | Equipos inscritos, conteos y grupos generados |
| `/programacion` | Programación de partidos |
| `/resultados` | Registro de marcadores y anotaciones individuales |
| `/estadisticas` | Ranking, goleadores, encestadores y reportes |
| `/usuarios` | Gestión de usuarios |
| `/perfiles` | Gestión de roles y módulos por rol |
| `/modulos` | Gestión de módulos del sistema |
| `/auditoria` | Consulta de acciones relevantes |

## Flujo Principal Para Probar

1. Iniciar sesión como administrador.
2. Revisar instituciones y evento demo.
3. Validar categorías con país asignado.
4. Revisar equipos por deporte.
5. Revisar participantes agrupados por equipo.
6. Filtrar inscripciones por deporte.
7. Entrar a sorteos y revisar equipos inscritos, confirmados y grupos.
8. Programar o revisar partidos.
9. Registrar resultados con anotaciones individuales.
10. Revisar estadísticas y reportes.

## Seguridad Y Permisos

La sesión se gestiona desde:

```text
src/context/AuthContext.tsx
```

El frontend maneja:

- `op_access_token`
- `op_refresh_token`
- `op_user`

El token se envía automáticamente mediante el interceptor de Axios en:

```text
src/services/api.ts
```

Las vistas protegidas usan:

```text
src/components/auth/ProtectedPage.tsx
src/components/auth/RequireModule.tsx
```

El sidebar muestra únicamente los módulos permitidos para el rol autenticado.

## Estructura Relevante

```text
src/app
  dashboard/
  deportes/
  equipos/
  estadisticas/
  eventos/
  inscripciones/
  instituciones/
  login/
  modulos/
  paises/
  participantes/
  perfiles/
  programacion/
  recuperar-password/
  reset-password/
  resultados/
  sorteos/
  usuarios/

src/components
  auth/
  common/
  layout/
  providers/

src/context
  AuthContext.tsx

src/services
  api.ts
  authService.ts
  crudServices.ts
  adminServices.ts

src/types
  auth.ts
  catalogs.ts
  admin.ts
```

## Componentes Reutilizables

Los módulos usan componentes comunes para mantener consistencia visual:

- `PageHeader`
- `TableToolbar`
- `DataTable`
- `PaginationControls`
- `FormModal`
- `EmptyState`
- `LoadingState`
- `PrimaryActionButton`
- `RowActions`
- `Badge`

## Servicios

- `authService`: login, refresh token, recuperación y cierre de sesión.
- `crudServices`: instituciones, países, eventos, deportes, equipos, participantes, inscripciones, sorteos, programación, resultados, estadísticas y reportes.
- `adminServices`: usuarios, roles, módulos, auditoría y dashboard.

## Dashboard

El dashboard consume:

```text
GET /api/dashboard/resumen
```

Muestra:

- métricas generales
- próximas contiendas
- actividad reciente
- accesos rápidos

## Portal Público

La ruta `/` es independiente del panel administrativo. Está orientada a visitantes y muestra:

- hero deportivo con imágenes del proyecto
- próximos encuentros
- estadísticas generales
- rankings o información pública del evento

## Reportes

Desde estadísticas se pueden descargar reportes ejecutivos:

- PDF
- Excel
- ranking por país
- medallero
- participantes por institución
- fixture completo

## Alertas Y Modales

Las alertas de éxito, error, confirmación y carga se centralizan en:

```text
src/utils/alerts.ts
```

Se usa SweetAlert2 para:

- confirmaciones
- mensajes de éxito
- errores
- estados de espera
- advertencias de validación

## Comandos Útiles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Notas Para Desarrollo

- Reiniciar backend si se cambia la semilla demo.
- Usar `DEMO_DATA_ENABLED=true` para restaurar una data limpia de exposición.
- Usar `DEMO_DATA_ENABLED=false` si se desea conservar datos creados manualmente.
- Si el login no reconoce credenciales después de modificar la data, reiniciar backend para limpiar el estado de sesión/cache del proceso.
