# Cronobros

Planificador colaborativo de viajes con itinerarios, roles, invitaciones, logística, Google Maps y Smart Import mediante Gemini en Vertex AI.

## Estado

- Producción: <https://crono-viajes-1779401310.web.app>
- Firebase Auth y Firestore con roles `owner`, `editor` y `viewer`.
- Google Maps con puntos persistidos y cálculo de rutas.
- Smart Import autenticado desde texto, PDF, JPEG, PNG y WebP.
- Functions de segunda generación sobre Node.js 22.

## Desarrollo local

Requisitos: Node.js 22+, npm y Firebase CLI.

```bash
npm install
npm --prefix functions install
cp .env.example .env.local
npm run dev
```

La aplicación web necesita únicamente configuración pública de Firebase y una clave de Maps restringida por HTTP referrer. **Gemini no usa una API key en el navegador**: las Functions invocan Vertex AI con su cuenta de servicio.

## Validación

```bash
npm run typecheck
npm run lint
npm test
npm --prefix functions test
```

Los tests frontend que inicializan Firebase requieren valores `VITE_FIREBASE_*` de prueba; no uses credenciales productivas.

## Deploy

```bash
firebase deploy --project crono-viajes-1779401310 --only hosting,functions,firestore:rules
```

Antes de desplegar Hosting, construí con la configuración pública correcta de Firebase y Maps. No reutilices variables placeholder de tests.

## Seguridad

- Nunca guardar claves, tokens o archivos `.env` en Git.
- Las callables requieren Firebase Auth.
- Los documentos importados se validan en cliente y servidor y se limitan a 7 MiB.
- App Check todavía no se fuerza: primero debe registrarse un proveedor web y desplegarse el cliente para evitar bloquear usuarios legítimos.

## Pendientes externos

- QA autenticado con cuentas reales.
- Configuración y activación coordinada de App Check.
- Integración de la rama final en `main` desde GitHub.
- Seguimiento del advisory transitivo de `uuid` dentro de dependencias de Firebase Admin/Google Cloud.
