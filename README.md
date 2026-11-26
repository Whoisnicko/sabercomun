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
Worker conectado a GitHub main. Database ID fijado en wrangler.jsonc según el propietario; confirmar permisos D1 y aplicar migraciones remotas. Deploy command `npm run deploy` ejecuta tests y despliega; una vez confirmado ID y permisos D1, `npm run deploy:with-db` también aplica migraciones. Confirmar respuesta de /api/health. No ejecutar migraciones remotas desde ramas de preview. Deshabilitar despliegues de ramas no productivas hasta disponer de una D1 separada.
No subir secretos, tokens ni datos personales a GitHub.
