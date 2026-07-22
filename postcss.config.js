# Executive Ops Dashboard

Proyecto Next.js + TypeScript listo para desplegar en Vercel.

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Cómo desplegarlo en Vercel (recomendado)

**Opción A — desde GitHub (más fácil):**
1. Crea un repositorio nuevo en GitHub y sube esta carpeta.
2. Entra a https://vercel.com, inicia sesión con tu cuenta de GitHub.
3. Click en "Add New Project", selecciona el repositorio.
4. Vercel detecta automáticamente que es Next.js — no cambies nada, solo dale "Deploy".
5. En 1-2 minutos tendrás una URL pública tipo `tu-proyecto.vercel.app`.

**Opción B — desde la terminal (Vercel CLI):**
```bash
npm install -g vercel
vercel login
vercel
```
Sigue las instrucciones en pantalla.
