# Checklist de lanzamiento · 25/11/2026 · v0.3

Estados: [x] realizado o verificado dentro del alcance especificado; [ ] pendiente. No equivale a auditoría integral.

## Infraestructura
- [x] GitHub: repositorio y ramas main/develop, permisos de escritura comprobados.
- [x] Configuración de Worker y binding DB en código.
- [x] URL de Workers proporcionada por propietario; conexión declarada por él.
- [x] Propietario confirmó respuesta de /api/health: version 0.3.0, mode preview, database not_initialized. Despliegue y consulta a D1 confirmados por diagnóstico compartido; faltan tablas.
- [ ] Confirmar ID y permisos de D1 en cuenta Cloudflare.
- [ ] Aplicar migraciones remotas y verificar /api/health.
- [ ] Separar D1 de pruebas y producción; backups, recuperación y límites de gasto.
- [ ] Activar verificación automática en Workers Builds: Deploy command npm run deploy; Node 22.13+.

## Producto
- [x] Marca v0.3, logo SVG, portada, catálogo y filtros, modalidades y precios de demostración identificados.
- [x] Estilo adaptable y mejoras de teclado y movimiento reducido en código.
- [ ] Validación visual en navegador escritorio/móvil, teclado y contraste de todos los estados.
- [ ] Login, alta, recuperación, confirmación correo, doble rol.
- [ ] Perfil profesional, publicación, edición, cupos y reservas, valoraciones, moderación.
- [ ] Clases en vivo, grabaciones, accesos tras compra.
- [ ] Panel administrativo, denuncia, cancelaciones, soporte.

## Seguridad
- [x] 8 pruebas locales con DB simulada; 4 de integración SQL con SQLite real en memoria; resultado 12/12 en Node 22.16 (copia local del Worker y esquema).
- [x] Cabeceras API iniciales, CSP en archivos estáticos, catálogo sin datos privados.
- [x] Escrituras y rutas privadas desactivadas en versión preliminar.
- [x] Esquema acepta reaplicación, rechaza precios/cupos/duración inválidos, instructor inexistente, identificador de pago duplicado, estado y rating inválidos.
- [ ] Confirmar cabeceras HTTP en URL real; ejecutar suite directamente sobre checkout y en Cloudflare.
- [ ] Hash y sesiones, CSRF, rate limits, Turnstile, control de autorización por objeto y rol, validación entradas, ataques XSS/SQLi, revisión de dependencias.
- [ ] Probar concurrencia en reservas, reembolsos, repetición de webhooks, acceso a grabaciones, retención/borrado de datos.
- [ ] Repositorio público por elección original del propietario; recomendar privado y escaneo de secretos antes de habilitar autenticación. Nunca guardar credenciales.
- [ ] Revisión final independiente y pruebas de integración con servicios externos.

## Mercado Pago
- [x] Revisada documentación oficial de Checkout Pro marketplace y OAuth por vendedor. Comisión propia objetivo 0.
- [ ] Confirmar elegibilidad de cuenta/marketplace y medios de pago (la documentación 1:1 advierte sobre uso de saldo disponible entre cuentas MP).
- [ ] Crear app en Mercado Pago, definir redirect URI, colocar secretos en Cloudflare.
- [ ] Diseñar/implementar OAuth state de un solo uso, token por vendedor cifrado y rotación.
- [ ] Preferencias de pago en servidor, monto y vendedor verificados, identificador único, marketplace_fee 0 si admitido.
- [ ] Validar firma webhook, consultar pago, validar monto/moneda/vendedor/orden, deduplicación y devoluciones.
- [ ] Sandbox: éxito, pendiente, rechazo, devolución, manipulación, repetición y revocación.
- [ ] Aprobar piloto antes de habilitar dinero real.

## Operación y lanzamiento
- [ ] Validar nombre comercial y dominio; identidad elegida sin búsqueda de marca.
- [ ] Políticas de privacidad, términos, responsabilidad del instructor, devoluciones, derechos de grabación, cumplimiento fiscal y consumidor Argentina.
- [ ] Verificación de identidad/credenciales de instructores en temas regulados; moderación y reportes.
- [ ] Modelo de costos de almacenamiento, video, notificaciones, soporte y fondos voluntarios.
- [ ] Piloto cerrado, aprobación pública.

## Pasos del propietario
1. Diagnóstico recibido: v0.3.0, not_initialized. Pendiente identificar D1 y aplicar esquema.
2. Cloudflare → Storage & databases → D1 → sabercomun-db (si no existe, crear); compartir únicamente el database ID.
3. Con ID fijado, Workers Builds → Settings → Deploy command: npm run deploy:with-db. Ejecuta verificación, migraciones remotas y despliegue. Requiere permisos D1; si falla, aplicar SQL desde consola D1 y revisar registros.
4. Después de verificar D1, mantener npm run deploy:with-db para futuras migraciones revisadas o npm run deploy si se gestionan manualmente.
5. No crear credenciales MP ni activar pagos hasta que exista flujo de usuario/orden seguro.

Fuentes: https://developers.cloudflare.com/workers/platform/deploy-buttons/
https://developers.cloudflare.com/d1/reference/migrations/
https://www.mercadopago.com.ar/developers/es/docs/split-payments/split-1-1/integration-configuration/integrate-marketplace
