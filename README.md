# Saber Común · v0.2-preview

Comunidad de aprendizaje práctico y oficios sin comisión propia. Una persona puede aprender y enseñar con una cuenta; clases en vivo y grabaciones económicas.

Esta versión inicia la migración desde el prototipo Python/SQLite de Aula Abierta. Es una vista de prueba, no una migración completa: catálogo de ejemplos, filtros y detalle interactivo; Worker y esquema D1 inicial. Registro, acceso a clases, publicación, pagos reales y datos históricos todavía no están migrados.

## Desplegar en Cloudflare
1. Cloudflare Dashboard → Workers & Pages → Create → importar repositorio GitHub `Whoisnicko/sabercomun`.
2. Nombre del Worker: `sabercomun`. Rama: `main`. Directorio raíz: repositorio. Build command: vacío. Deploy command: `npx wrangler deploy`.
3. Wrangler 4.45+ puede aprovisionar D1 automáticamente si no hay ID; comprueba el binding DB y copia el database_id a wrangler.jsonc después del primer despliegue (sin secretos).
4. Ejecutar `npm install` y `npx wrangler d1 migrations apply DB --remote` desde una terminal autenticada, tras guardar el ID. O ejecutar SQL de migrations/0001_initial.sql en la consola D1 una sola vez.
5. Verificar la URL workers.dev y /api/health. El catálogo de ejemplo sigue visible si D1 aún no está inicializada.
6. Usar un segundo Worker y otra D1 para pruebas de cambios con datos antes de lanzar el servicio.

## Local
Node.js 22 o superior recomendado. `npm install`, `npx wrangler d1 migrations apply DB --local`, `npm run dev`.
No subir .env, .dev.vars, tokens, bases de datos locales o información personal. Nunca activar cobros de prueba como si fueran pagos reales.

## Roadmap
- [x] Inicializar GitHub
- [x] Vista preliminar y configuración Worker/D1
- [ ] Despliegue comprobado en cuenta Cloudflare
- [ ] Migrar autenticación, doble rol, creación de cursos, inscripciones y permisos del prototipo original
- [ ] Verificación de profesores, protección contra abuso, recuperación de cuenta, privacidad
- [ ] Mercado Pago marketplace, OAuth de vendedores, verificación de webhooks, devoluciones
- [ ] Videoclases y grabaciones protegidas; moderación
