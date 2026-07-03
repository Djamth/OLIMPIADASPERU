# Pruebas E2E

Estas pruebas validan el flujo principal del sistema desde el navegador:

- Login y redireccion de rutas protegidas.
- Restriccion de modulos por permisos.
- Recorrido de instituciones, eventos/categorias, equipos, participantes, inscripciones, sorteos, programacion, resultados y estadisticas.
- Filtros por deporte.
- Apertura de formularios principales.
- RBAC granular: CRUD de acciones para administrador y bloqueo de endpoints administrativos para usuario consulta.

## Requisitos

1. Levantar backend en `http://localhost:8080/olimpiadas`.
2. Tener la data demo cargada.
3. Instalar navegadores de Playwright una vez:

```bash
npx playwright install chromium
```

## Comandos

```bash
npm run test:e2e
npm run test:e2e:ui
```

Variables opcionales:

```bash
E2E_BASE_URL=http://127.0.0.1:3000
E2E_API_BASE_URL=http://localhost:8080/olimpiadas
E2E_ADMIN_EMAIL=admin@olimpiadasperu.pe
E2E_ADMIN_PASSWORD=Admin123*
E2E_CONSULTA_EMAIL=consulta@olimpiadasperu.pe
E2E_CONSULTA_PASSWORD=Admin123*
```
