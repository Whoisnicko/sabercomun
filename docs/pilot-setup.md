# V0.6 — entorno de prueba independiente

## Estado
- Propietario creó D1 sabercomun-dev y compartió su ID.
- develop: Worker sabercomun-dev, bindings DB y AUTH_DB apuntan a esa misma D1 aislada, nunca a la D1 de producción.
- main: sin cambios, continúa con sabercomun y su propia base.
- Migraciones de piloto: pilot-migrations/0001_initial.sql y 0002_auth.sql; comando npm run deploy:pilot verifica nombre e ID, ejecuta tests, migra la base de prueba y despliega.
- El código de autenticación permanece apagado si faltan variables/secretos. No se configuraron ni compartieron credenciales.
- Pendiente: ejecutar suite y despliegue real, verificar /api/health, configurar proveedor de correo, probar flujo de correo real y controles de abuso.

## Cloudflare
1. Crear Worker independiente llamado sabercomun-dev (si la creación desde GitHub no permite elegir la rama antes de desplegar, crear primero un Worker vacío).
2. En ese Worker, Settings → Builds, conectar Whoisnicko/sabercomun con production branch develop, Preview Builds desactivado, root /, build command vacío, deploy command npm run deploy:pilot. Mantener el Worker sabercomun conectado exclusivamente a main.
3. Confirmar permisos Workers y D1 Edit para la compilación, Node 22.13+.
4. Abrir /api/health en el dominio de prueba. Esperar version 0.6.0, mode pilot, database ready.
5. /api/auth/config debe responder enabled false hasta completar variables. No activar todavía.

## Seguridad y correo
Configurar después en el Worker de prueba AUTH_MODE=pilot, AUTH_ORIGIN con su origen HTTPS exacto, AUTH_ALLOWED_EMAILS (secreto; lista cerrada de correos), RESEND_API_KEY (secreto) y MAIL_FROM. Nunca registrar datos personales en GitHub. keep_vars conserva las variables del dashboard. Resend necesita remitente autorizado; el dominio propio puede ser necesario para enviar a otros usuarios.
Se mantienen pendientes pruebas reales de correo, rate limiting global/IP, expiración y limpieza, revisión de privacidad y autorización de perfiles. No habilitar dinero real ni registros públicos.
