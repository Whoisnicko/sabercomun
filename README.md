# Saber Común · v0.3

Comunidad de aprendizaje práctico y oficios. Una cuenta para aprender y enseñar. Clases en vivo y grabaciones a menor precio. Comisión propia objetivo: cero.

**Vista previa, no plataforma transaccional.** Catálogo ilustrativo y diseño; API de lectura; esquema D1 versionado. No hay login, reservas, cobros ni acceso a video reales. No introducir datos personales.

- [Sitio de prueba](https://sabercomun.nickuz.workers.dev/)
- [Checklist de lanzamiento](docs/launch-checklist.md)
- [Identidad visual](docs/identity.md)

## Desarrollo
Node 22.13+ (pruebas SQL usan node:sqlite).
```
npm install
npm run verify
npx wrangler d1 migrations apply DB --local
npm run dev
```

## Cloudflare
Worker conectado a GitHub main. Verificar recursos y actualizar database_id en wrangler.jsonc antes de aplicar migraciones remotas. Deploy command `npm run deploy` ejecuta tests y despliega; una vez confirmado ID y permisos D1, `npm run deploy:with-db` también aplica migraciones. Confirmar respuesta de /api/health. No utilizar la misma D1 para previews con escrituras y producción.
No subir secretos, tokens ni datos personales a GitHub.
