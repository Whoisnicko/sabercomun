# Checklist técnico de lanzamiento

## D1
- [x] Esquema SQL inicial versionado.
- [ ] Confirmar ID de sabercomun-db en Cloudflare (no es secreto).
- [ ] Fijar database_id en wrangler.jsonc.
- [ ] Aplicar migraciones con npm run db:migrate (requiere autorización de Cloudflare).
- [ ] Verificar /api/health: database ready.
- [ ] Usar D1 distinta para desarrollo.

## Seguridad
- [x] Pruebas unitarias de la vista previa: 8 casos con DB simulada.
- [x] Cabeceras HTTP y CSP inicial.
- [x] Exclusión explícita de campos privados del catálogo.
- [ ] Verificar cabeceras y pruebas de integración contra despliegue real.
- [ ] Registro, confirmación de correo, recuperación, sesiones seguras, hash de contraseña, CSRF, Turnstile, limitación de solicitudes.
- [ ] Permisos de instructor/estudiante, acceso según compra, pruebas de acceso horizontal, límites de cupos.
- [ ] Auditoría de dependencias y pruebas antes de producción.

## Mercado Pago (Argentina)
- [ ] Crear aplicación Checkout Pro para marketplace en panel oficial.
- [ ] Configurar OAuth de instructores, state de un solo uso, almacenamiento cifrado y rotación de tokens.
- [ ] Preferencias de pago calculadas en servidor, marketplace_fee 0, identificador de orden único.
- [ ] Verificar firma de webhook y consultar estado real a MP; validar vendedor, monto, moneda y orden. Procesar duplicados y devoluciones.
- [ ] Probar compradores/vendedores de prueba, rechazo, pendiente, éxito, manipulación de precios y devolución.
- [ ] No activar pagos de producción hasta aprobación.

Credenciales exclusivamente en secretos de Cloudflare. No enviar por chat ni guardar en GitHub.
Referencias: https://www.mercadopago.com.ar/developers/es/docs/split-payments/split-1-1/integration-configuration/integrate-marketplace
https://developers.cloudflare.com/d1/reference/migrations/
