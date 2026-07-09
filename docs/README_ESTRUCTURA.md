# 📁 Guía de Estructura del Proyecto Olimpiadas Perú

<div align="center">
  
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.0.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
![Java](https://img.shields.io/badge/Java-21-orange)
![Status](https://img.shields.io/badge/Status-En%20Desarrollo-yellow)

</div>

> Esta guía proporciona una visión rápida de la arquitectura del sistema Olimpiadas Perú, indicando exactamente qué archivos modificar para cada tipo de cambio.

## Vista general

```text
OLIMPIADASPERU/
├── backend/      API REST con Spring Boot
├── frontend/     Portal publico y panel administrativo con Next.js
├── docs/         Documentacion, guias e imagenes del proyecto
├── .github/      Automatizacion CI con GitHub Actions
└── README.md     Documentacion principal del repositorio
```

## Backend

Ruta base:

```text
backend/src/main/java/com/sistema/olimpiadas_peru
```

El backend esta organizado por dominio funcional. Cada modulo sue:

```text
controller/   Endpoints REST
service/      Logica de negocio
repository/   Acceso a base de datos
entity/       Entidades JPA
dto/          Objetos request/response
event/        Eventos y listeners, cuando aplica
```

### Carpetas principales del backend

| Carpeta | Que contiene | Cuando tocarla |
| --- | --- | --- |
| `auth1` | Login, JWT, usuarios, roles, modulos, acciones, permisos, recuperacion de password, correo base | Cambios de seguridad, login, RBAC, usuarios, perfiles o acciones |
| `institucion` | CRUD de instituciones participantes | Cambiar datos de institucion, RUC, contacto, administrador |
| `evento` | Eventos de olimpiadas por institucion | Cambiar ciclo del evento, fechas, estado o reglas del evento |
| `categoria` | Categorias del evento y asignacion de pais representativo | Cambiar logica de paises por categoria o evitar pais repetido |
| `pais` | Catalogo de paises, bandera, colores y dato cultural | Agregar paises, cambiar colores, activar/desactivar paises |
| `deporte` | Deportes oficiales y reglas base | Cambiar futbol, basquet, voley, ping pong o validaciones deportivas |
| `equipo` | Equipos por institucion, categoria, pais y deporte | Cambiar creacion de equipos o reglas de genero/deporte |
| `participante` | Participantes y plantillas por equipo | Cambiar jugadores, capitanes, suplentes o dorsal |
| `inscripcion` | Inscripcion de equipos a deportes/eventos | Cambiar confirmacion, estados o notificacion de inscripcion |
| `sorteo` | Sorteo aleatorio y generacion de grupos | Cambiar algoritmo de sorteo o visualizacion de grupos |
| `programacion` | Programacion de partidos, fecha, hora, sede y estado | Cambiar fixture, reprogramaciones o notificacion de partido |
| `resultado` | Registro de marcadores y anotaciones individuales | Cambiar resultados, goleadores, encestadores o evitar duplicados |
| `estadistica` | Rankings, goleadores y estadisticas por deporte | Cambiar calculos de ranking o tablas estadisticas |
| `reporte` | Reportes PDF/ejecutivos, ranking por pais, medallero, fixture | Cambiar diseno o contenido de reportes |
| `notificacion` | Notificaciones internas del sistema | Cambiar campana, historial, leidas/no leidas o tipos de aviso |
| `dashboard` | Resumen ejecutivo y portal publico | Cambiar KPIs, graficas, proximos partidos o alertas |
| `common` | Excepciones y utilidades compartidas | Cambiar respuestas de error o manejo global de excepciones |
| `config` | Configuraciones generales | Cambiar Swagger/OpenAPI u otra configuracion transversal |
| `security` | Utilidades de seguridad transversales | Cambios finos de autorizacion o usuario autenticado |
| `shared` | Clases compartidas entre modulos | Cambios comunes reutilizados por varios dominios |

### Archivos clave del backend

| Necesidad | Archivo o carpeta |
| --- | --- |
| Configurar conexion a BD, JWT, correo, demo data | `backend/src/main/resources/application.properties` y `backend/.env` |
| Plantilla de variables de entorno | `backend/.env.example` |
| Migraciones Flyway | `backend/src/main/resources/db/migration/` |
| Data demo reiniciable | `backend/src/main/resources/demo-data.sql` |
| Seguridad HTTP y rutas protegidas | `backend/src/main/java/.../auth1/config/SecurityConfig.java` |
| Generar/validar JWT | `backend/src/main/java/.../auth1/security/JwtTokenProvider.java` |
| Validar permisos por rol/modulo/accion | `backend/src/main/java/.../auth1/security/RolSecurityService.java` |
| Envio de correos | `backend/src/main/java/.../auth1/service/EmailService.java` |
| Recuperacion de password | `backend/src/main/java/.../auth1/service/PasswordResetService.java` |
| Reporte PDF estadistico | `backend/src/main/java/.../reporte/service/ReporteEstadisticaService.java` |
| Reporte PDF ejecutivo | `backend/src/main/java/.../reporte/service/ReporteEjecutivoArchivoService.java` |
| Pruebas backend | `backend/src/test/java/` |
| Prueba de rendimiento k6 | `backend/src/test/performance/public-dashboard.js` |

### Backend

| Funcion | Donde buscar |
| --- | --- |
| Cambiar validacion de futbol/basquet/voley/ping pong | `deporte/service` y servicios de `inscripcion`, `resultado`, `programacion` |
| Cambiar como se asigna un pais | `categoria/service/CategoriaEventoService.java` |
| Evitar pais repetido | `categoria` y entidad `CategoriaEvento` |
| Cambiar sorteo de grupos | `sorteo/service/SorteoService.java` |
| Evitar partido contra el mismo equipo | `programacion/service/ProgramacionService.java` |
| Evitar resultado duplicado | `resultado/service/ResultadoService.java` |
| Cambiar ranking/goleadores | `estadistica/service/EstadisticaService.java` |
| Cambiar PDF | `reporte/service/` |
| Cambiar email de notificacion | listeners en `inscripcion/event`, `programacion/event`, `resultado/event` |
| Cambiar permisos de una ruta | controlador correspondiente y `RolSecurityService` |

## Frontend

Ruta base:

```text
frontend/src
```

El frontend usa Next.js con App Router. Cada ruta visual esta dentro de `src/app`.

### Carpetas principales del frontend

| Carpeta | Que contiene | Cuando tocarla |
| --- | --- | --- |
| `app` | Paginas/rutas del sistema | Cambiar pantalla completa de un modulo |
| `components` | Componentes reutilizables | Cambiar tablas, botones, layout, navbar, sidebar, cards |
| `context` | Estado global, principalmente autenticacion | Cambiar sesion, login persistente, usuario actual |
| `hooks` | Hooks reutilizables | Cambiar paginacion, busqueda o carga asincrona |
| `services` | Consumo de API con Axios | Cambiar endpoint que consume una pantalla |
| `styles` | CSS modular del sistema | Cambiar colores, sidebar, topbar, login, portal publico |
| `types` | Tipos TypeScript de backend/frontend | Cambiar estructura esperada de responses |
| `utils` | Utilidades comunes | Cambiar permisos frontend, alertas o helpers |
| `assets` | Recursos estaticos internos | Imagenes o recursos importados desde codigo |

### Rutas/paginas principales

| Ruta | Carpeta | Que representa |
| --- | --- | --- |
| `/` | `app/page.tsx` | Portal publico |
| `/login` | `app/login/page.tsx` | Login |
| `/recuperar-password` | `app/recuperar-password/page.tsx` | Solicitud de codigo |
| `/reset-password` | `app/reset-password/page.tsx` | Cambio de password con codigo |
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard ejecutivo |
| `/usuarios` | `app/usuarios/` | CRUD de usuarios |
| `/perfiles` | `app/perfiles/` | Roles, modulos y acciones |
| `/acciones` | `app/acciones/` | CRUD de acciones RBAC |
| `/auditoria` | `app/auditoria/` | Logs de auditoria |
| `/instituciones` | `app/instituciones/` | CRUD de instituciones |
| `/eventos` | `app/eventos/` | Eventos y categorias |
| `/paises` | `app/paises/` | Catalogo de paises |
| `/deportes` | `app/deportes/` | Deportes oficiales |
| `/equipos` | `app/equipos/` | Equipos |
| `/participantes` | `app/participantes/` | Participantes por equipo |
| `/inscripciones` | `app/inscripciones/` | Inscripcion de equipos |
| `/sorteos` | `app/sorteos/` | Sorteo y grupos |
| `/programacion` | `app/programacion/` | Programacion de partidos |
| `/resultados` | `app/resultados/` | Marcadores y anotaciones |
| `/estadisticas` | `app/estadisticas/` | Ranking, reportes y estadisticas |
| `/notificaciones` | `app/notificaciones/page.tsx` | Centro de notificaciones |
| `/perfil` | `app/perfil/page.tsx` | Perfil y cambio/recuperacion de password |

### Componentes reutilizables importantes

| Componente | Archivo | Para que sirve |
| --- | --- | --- |
| Layout principal | `components/layout/AppShell.tsx` | Estructura general del panel privado |
| Sidebar | `components/layout/AppSidebar.tsx` | Menu lateral, colapsable, modo oscuro del sidebar |
| Topbar/Navbar | `components/layout/AppNavbar.tsx` | Buscador, notificaciones, perfil, logout |
| Tabla reutilizable | `components/common/DataTable.tsx` | Estilo base de tablas |
| Botones reutilizables | `components/common/Buttons.tsx` | Boton nuevo, editar, eliminar, secundario |
| Toolbar de tabla | `components/common/TableToolbar.tsx` | Busqueda, contador, page size |
| Paginacion | `components/common/PaginationControls.tsx` | Controles de pagina |
| Header de modulo | `components/common/PageHeader.tsx` | Titulo y descripcion de cada modulo |
| KPIs de modulo | `components/common/ModuleKpis.tsx` | Tarjetas de indicadores |
| Modales | `components/common/FormModal.tsx` | Crear/editar registros |
| Badges | `components/common/Badge.tsx` | Estados visuales |
| Banderas | `components/common/CountryFlag.tsx` | Muestra bandera de pais |
| Proteccion de pagina | `components/auth/ProtectedPage.tsx` | Requiere sesion |
| Proteccion por modulo | `components/auth/RequireModule.tsx` | Requiere modulo autorizado |
| Portal publico | `components/public-portal/` | Navbar, secciones, cards y tabla publica |
| Graficas dashboard | `components/dashboard/Sport3DCharts.tsx` | Graficas con ECharts |

### Estilos frontend

El archivo global importa estilos separados:

```text
frontend/src/app/globals.css
```

No conviene poner estilos largos directamente alli. El archivo solo importa:

| Archivo CSS | Que controla |
| --- | --- |
| `styles/base.css` | Base global, fuente, body, variables generales |
| `styles/public-portal.css` | Portal publico, secciones full screen y scroll |
| `styles/auth.css` | Login, recuperar password, reset password |
| `styles/utilities.css` | Utilidades visuales compartidas |
| `styles/admin-shell.css` | Contenedor general del panel administrativo |
| `styles/admin-theme-base.css` | Tema base del panel |
| `styles/admin-sidebar-premium.css` | Sidebar premium |
| `styles/admin-sidebar-theme.css` | Modo oscuro y variantes del sidebar |
| `styles/admin-navbar.css` | Topbar, buscador, notificaciones, perfil |
| `styles/admin-content.css` | Cards, tablas, contenedores de modulos |
| `styles/admin-dark-legacy.css` | Compatibilidad de modo oscuro anterior |
| `styles/admin-dark-scope.css` | Alcance del modo oscuro |

### Modificaciones visuales frecuentes

| Pedido | Donde cambiar |
| --- | --- |
| Color del boton "Nuevo" | `components/common/Buttons.tsx`, funcion `PrimaryActionButton` |
| Color de botones editar/eliminar | `components/common/Buttons.tsx`, funcion `IconActionButton` |
| Estilo general de tablas | `components/common/DataTable.tsx` |
| Espaciado de filas de tablas | `components/common/DataTable.tsx`, clases `px`, `py`, `text-[13px]` |
| Buscador y contador de tabla | `components/common/TableToolbar.tsx` |
| Paginacion | `components/common/PaginationControls.tsx` |
| Header de modulos | `components/common/PageHeader.tsx` |
| Fondo/contenido de modulos | `styles/admin-content.css` |
| Sidebar | `components/layout/AppSidebar.tsx` y `styles/admin-sidebar-premium.css` |
| Modo oscuro del sidebar | `styles/admin-sidebar-theme.css` y `styles/admin-dark-scope.css` |
| Topbar/notificaciones/perfil | `components/layout/AppNavbar.tsx` y `styles/admin-navbar.css` |
| Login | `app/login/page.tsx` y `styles/auth.css` |
| Recuperar password | `app/recuperar-password/page.tsx` y `styles/auth.css` |
| Portal publico | `components/public-portal/` y `styles/public-portal.css` |

### Cambiar datos que se muestran

| Pedido | Donde cambiar frontend | Donde cambiar backend |
| --- | --- | --- |
| Agregar columna a una tabla | Cliente del modulo en `app/<modulo>/<Modulo>Client.tsx` | DTO response del modulo |
| Cambiar formulario de crear/editar | Cliente del modulo en `app/<modulo>/` | DTO request y service |
| Cambiar endpoint consumido | `services/adminServices.ts` o `services/crudServices.ts` | Controller correspondiente |
| Cambiar permisos visibles | `utils/access.ts` y componentes de botones | `RolSecurityService` y controllers |
| Cambiar dashboard | `app/dashboard/page.tsx`, `components/dashboard/` | `dashboard/service` |
| Cambiar estadisticas | `app/estadisticas/EstadisticasClient.tsx` | `estadistica/service` y `reporte/service` |
| Cambiar notificaciones | `app/notificaciones/page.tsx`, `AppNavbar.tsx` | `notificacion/service` y listeners |

## Servicios frontend y conexion con backend

| Archivo | Uso |
| --- | --- |
| `services/api.ts` | Configuracion Axios, base URL, token, refresh/logout |
| `services/authService.ts` | Login, logout, recuperar password, reset password |
| `services/adminServices.ts` | Usuarios, roles, modulos, acciones, dashboard, notificaciones, auditoria |
| `services/crudServices.ts` | CRUDs principales: instituciones, deportes, equipos, participantes, inscripciones, programacion, resultados, paises, eventos |

Si una pantalla no trae datos, revisar primero:

1. Servicio en `frontend/src/services`.
2. Endpoint backend en `controller`.
3. Permisos del usuario en `perfiles`.
4. Consola del navegador y respuesta HTTP.

## Pruebas y calidad

| Tipo | Ruta/comando |
| --- | --- |
| Pruebas backend | `backend/src/test/java` con `backend/mvnw test` |
| Pruebas frontend unitarias | `frontend/src/**/*.test.ts` con `npm test` |
| Typecheck frontend | `npm run typecheck` |
| E2E Playwright | `frontend/e2e` con `npm run test:e2e` |
| Rendimiento k6 | `backend/src/test/performance/public-dashboard.js` |
| CI GitHub Actions | `.github/workflows/ci.yml` |

## Guia rapida de cambios



| Funcionalidad | Backend | Frontend |
| --- | --- | --- |
| Login/JWT | `auth1/controller/AuthController.java`, `auth1/security` | `app/login`, `context/AuthContext.tsx` |
| Usuarios | `auth1/controller/UsuarioController.java` | `app/usuarios` |
| Perfiles/permisos | `auth1/controller/RolController.java`, `RolSecurityService` | `app/perfiles`, `utils/access.ts` |
| Acciones RBAC | `auth1/controller/AccionController.java` | `app/acciones` |
| Auditoria | `auth1/controller/AuditoriaController.java` | `app/auditoria` |
| Instituciones | `institucion` | `app/instituciones` |
| Eventos/categorias | `evento`, `categoria` | `app/eventos` |
| Paises | `pais` | `app/paises` |
| Equipos | `equipo` | `app/equipos` |
| Participantes | `participante` | `app/participantes` |
| Inscripciones | `inscripcion` | `app/inscripciones` |
| Sorteos | `sorteo` | `app/sorteos` |
| Programacion | `programacion` | `app/programacion` |
| Resultados | `resultado` | `app/resultados` |
| Estadisticas/reportes | `estadistica`, `reporte` | `app/estadisticas` |
| Notificaciones | `notificacion`, listeners `event` | `app/notificaciones`, `AppNavbar.tsx` |
| Portal publico | `dashboard/controller/PublicDashboardController.java` | `app/page.tsx`, `components/public-portal` |

## Recomendacion para el equipo
- Antes de hacer cambios, actualizar el repositorio y probar que todo funciona con la data demo. Pasos recomendados:

1. Hacer `git pull`.
2. Revisar `.env`.
3. Ejecutar backend y frontend.
4. Probar login admin.
5. Probar flujo principal con data demo.
6. No modificar `tsconfig.tsbuildinfo`, `.next`, `target`, `playwright-report` ni `test-results`.
