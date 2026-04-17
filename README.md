# Catalogo_productos

Prueba tecnica backend para administrar un catalogo de productos digitales.

## Stack usado

- PHP 8.3+
- Laravel 13
- Next.js 16
- SQLite
- Docker / Docker Compose
- PHPUnit

## Arquitectura

El backend esta organizado por capas:

- `routes`: define los endpoints
- `controllers`: reciben la peticion HTTP
- `requests`: validan la entrada
- `services`: manejan la logica de negocio
- `repositories`: encapsulan acceso a datos
- `models`: representan las tablas de base de datos

## Campos del producto

Cada producto contiene:

- `sku`
- `name`
- `description`
- `price`
- `type`
- `is_active`

## Endpoints

- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

## Proteccion basica

Los endpoints de productos estan protegidos con una API Key enviada en el header:

`X-API-KEY`

## Como ejecutar el proyecto

### Opcion recomendada: Docker Compose

Desde la raiz del proyecto:

```powershell
docker compose up --build
```

La API queda disponible en:

`http://localhost:8000`

Para detener los contenedores:

```powershell
docker compose down
```

### Variables de entorno

Configurar en `backend/.env`:

- `DB_CONNECTION=sqlite`
- `PRODUCTS_API_KEY=tu-clave`

El archivo `backend/.env.example` incluye la variable necesaria.

### Frontend en Next.js

Configurar en `frontend/.env.local`:

- `BACKEND_API_URL=http://localhost:8000/api`
- `BACKEND_API_KEY=tu-clave`

Puedes usar `frontend/.env.example` como base.

Desde la carpeta `frontend`:

```powershell
npm install
npm run dev
```

El frontend queda disponible en:

`http://localhost:3000`

El navegador consume rutas internas de Next (`/api/...`) y esas rutas proxyan hacia Laravel para no exponer la API key en el cliente.

## Como probar la API

### Health check

```http
GET /api/health
```

### Crear producto

```http
POST /api/products
```

Headers:

- `Content-Type: application/json`
- `Accept: application/json`
- `X-API-KEY: tu-clave`

Body:

```json
{
  "sku": "PROD-001",
  "name": "Plantilla financiera premium",
  "description": "Plantilla editable para presupuesto y flujo de caja",
  "price": 49.99,
  "type": "plantilla",
  "is_active": true
}
```

### Listar productos

```http
GET /api/products
```

Nota: este listado devuelve solo productos activos. Los productos inhabilitados no aparecen en el catalogo principal.

### Actualizar producto

```http
PUT /api/products/1
```

### Inhabilitar producto

```http
DELETE /api/products/1
```

Nota: el endpoint `DELETE` no elimina fisicamente el producto; cambia `is_active` a `false`.

## Validaciones implementadas

- `sku` obligatorio y unico
- `name` obligatorio
- `price` obligatorio y mayor o igual a 0
- `type` obligatorio
- `description` opcional
- `is_active` booleano

## Ejecutar pruebas

Desde la carpeta `backend`:

```powershell
docker run --rm -v "${PWD}:/app" -w /app composer php artisan test
```

## Manejo de errores

- `401` cuando no se envia la API Key correcta
- `404` cuando el producto no existe
- `422` para errores de validacion

## Bonus implementados

- Docker / Docker Compose
- Documentacion OpenAPI en `docs/openapi.yaml`
- Migraciones de base de datos
- Arquitectura por capas
- Validacion de entradas

## Que cambiaria para soportar 1 millon de usuarios diarios

Si este servicio tuviera que soportar 1 millon de usuarios diarios, haria varios cambios enfocados en escalabilidad, rendimiento y estabilidad:

- Cambiaria SQLite por una base de datos mas robusta como PostgreSQL o MySQL, porque SQLite funciona bien para desarrollo y pruebas, pero no para alta concurrencia.
- Agregaria paginacion en el listado de productos para no devolver todos los registros en una sola consulta.
- Implementaria cache con Redis para consultas frecuentes, por ejemplo el listado de productos activos.
- Separaria lectura y escritura de base de datos si la carga crece, usando replicas para lectura.
- Desplegaria la aplicacion en contenedores con balanceo de carga para poder escalar horizontalmente.
- Moveria tareas pesadas o secundarias a colas, por ejemplo procesos de sincronizacion, auditoria o notificaciones.
- Agregaria monitoreo, alertas y trazabilidad con herramientas de logs y metricas para detectar errores y cuellos de botella.
- Reemplazaria la proteccion basica por un esquema de autenticacion mas solido, como JWT o Laravel Sanctum.
- Documentaria formalmente la API con OpenAPI/Swagger para facilitar integracion y mantenimiento.

En resumen, para ese nivel de trafico el objetivo ya no seria solo que el sistema funcione, sino que responda rapido, escale sin afectar al usuario y sea facil de operar en produccion.

## Guia de apoyo

Tambien se incluye una guia explicativa en modo dummies para repasar el proyecto antes de la entrevista:

`docs/guia-dummies.html`
