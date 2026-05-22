# Frontend - Olimpiadas Peru

Frontend administrativo para el sistema **Olimpiadas Peru**, construido con **Next.js**, **TypeScript**, **Tailwind CSS**, **Axios**, **SweetAlert2** y **Lucide React**.

La aplicacion permite gestionar instituciones, deportes, equipos, participantes, inscripciones, sorteos, programacion, resultados, estadisticas, usuarios y perfiles con permisos por modulo.

## Requisitos

- Node.js 20 o superior recomendado.
- Backend Spring Boot ejecutandose.
- Base de datos backend poblada con usuarios, roles y modulos.

## Instalacion

```bash
npm install
```

## Configuracion

La URL base del backend se toma desde la variable:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/olimpiadas
```

Si no se define, la aplicacion usa por defecto:

```ts
http://localhost:8080/olimpiadas
```

Puedes crear un archivo `.env.local` en la carpeta `frontend`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/olimpiadas
```

## Ejecutar en desarrollo

```bash
npm run dev
```

URL local:

```text
http://localhost:3000
```

## Compilar produccion

```bash
npm run build
```

Ejecutar build:

```bash
npm run start
```

## Credenciales de prueba

Estas credenciales dependen de la data cargada en el backend:

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

## Rutas principales

| Ruta | Descripcion |
| --- | --- |
| `/login` | Inicio de sesion |
| `/dashboard` | Resumen general conectado al backend |
| `/instituciones` | CRUD de instituciones |
| `/deportes` | CRUD de deportes y reglas base |
| `/equipos` | CRUD de equipos |
| `/participantes` | CRUD de participantes |
| `/inscripciones` | Inscripcion de equipos por deporte |
| `/sorteos` | Generacion y consulta de grupos |
| `/programacion` | Programacion de partidos |
| `/resultados` | Registro de marcadores y anotaciones |
| `/estadisticas` | Ranking y goleadores |
| `/usuarios` | Gestion de usuarios |
| `/perfiles` | Gestion de roles y modulos por rol |

## Seguridad y permisos

El login guarda en `localStorage`:

- `op_access_token`
- `op_refresh_token`
- `op_user`

El token se envia automaticamente en cada request mediante el interceptor de Axios en:

```text
src/services/api.ts
```

El sidebar filtra los modulos visibles segun los modulos devueltos por el login. Adicionalmente, las pantallas sensibles usan:

```text
src/components/auth/RequireModule.tsx
```

Si un usuario no tiene permisos, se muestra una vista de acceso restringido.

## Estructura relevante

```text
src/app
  dashboard/
  deportes/
  equipos/
  estadisticas/
  inscripciones/
  instituciones/
  login/
  participantes/
  perfiles/
  programacion/
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

## Componentes reutilizables

Los CRUD usan componentes comunes para mantener el diseño consistente:

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

Servicios principales:

- `authService`: login.
- `crudServices`: instituciones, deportes, equipos, participantes, inscripciones, programacion, resultados, sorteos y estadisticas.
- `adminServices`: usuarios, roles, modulos y dashboard.

## Dashboard

El dashboard consume:

```text
GET /api/dashboard/resumen
```

Este endpoint devuelve:

- metricas generales
- avance funcional
- proximas contiendas

## Alertas y modales

Las alertas de exito, error, confirmacion y carga se centralizan en:

```text
src/utils/alerts.ts
```

Se usa SweetAlert2 para confirmaciones, estados de espera y respuestas visuales.

## Comandos utiles

```bash
npm run dev
npm run build
npm run start
```

## Notas

- El frontend ya no depende de Bootstrap.
- El diseño principal usa Tailwind CSS.
- Si se modifica el backend o se agregan nuevos modulos, actualizar los tipos y servicios correspondientes.
- Si el dashboard no carga, verificar que el backend haya sido reiniciado despues de agregar `/api/dashboard/resumen`.
