# V0.4 — autenticación, primera etapa

Estado: desarrollo, sin rutas públicas habilitadas. main permanece en v0.3.0.

- Módulo session.js: token aleatorio de 256 bits, digest SHA-256 en base de datos, cookie __Host- Secure HttpOnly SameSite=Lax, vigencia absoluta de siete días, revocación y consulta parametrizada.
- Validación de origen y JSON para futuras operaciones de escritura. No reemplaza todos los controles CSRF ni límites de uso.
- 4 pruebas nuevas ejecutadas localmente con Node 22.16 y SQLite en memoria; todas aprobadas. Verificar integración en Workers antes de publicar.
- La sesión no equivale a verificar identidad ni contraseñas. Aún faltan registro, inicio de sesión, confirmación de email, recuperación y protección de intentos automatizados.
- Diseñar autenticación de contraseña con algoritmo adaptativo (OWASP recomienda Argon2id o scrypt); medir límites CPU/memoria de Workers y evaluar autenticación gestionada o sin contraseña antes de elegir. No utilizar SHA-256 simple para contraseñas: el digest de este módulo es solo para tokens aleatorios.
- Separar D1 de desarrollo y producción antes de habilitar escrituras en una versión de prueba.
- No habilitar pagos ni registros públicos aún.

Referencias: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/
