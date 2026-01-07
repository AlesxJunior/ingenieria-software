# 🚀 Despliegue en Vercel - Alexa Tech Frontend

## 📋 Configuración Automática

Este proyecto está configurado para desplegarse automáticamente en Vercel.

### ✅ Pasos para Desplegar

#### 1️⃣ Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Add New Project"**
3. Importa este repositorio desde GitHub

#### 2️⃣ Configuración del Proyecto

Vercel detectará automáticamente la configuración gracias al `vercel.json`, pero verifica:

```
Framework Preset: Vite
Root Directory: alexa-tech-react
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x o superior
```

#### 3️⃣ Variables de Entorno

En la sección **Environment Variables** de Vercel, agrega:

**Para desarrollo/pruebas locales:**
```
VITE_API_URL=http://localhost:3001/api
```

**Para backend en tu red local (acceso desde tu WiFi):**
```
VITE_API_URL=http://TU_IP_LOCAL:3001/api
```
Ejemplo: `http://192.168.1.100:3001/api`

**Para backend desplegado (futuro):**
```
VITE_API_URL=https://tu-backend.onrender.com/api
```

#### 4️⃣ Deploy

Click en **"Deploy"** y espera 2-3 minutos ⏳

---

## 🌐 Después del Despliegue

Tu frontend estará disponible en:
```
https://tu-proyecto.vercel.app
```

### ⚠️ Importante: Configurar CORS en el Backend

Para que el frontend desplegado pueda conectarse a tu backend, necesitas configurar CORS:

**En tu backend (`alexa-tech-backend/src/index.ts` o similar):**

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tu-proyecto.vercel.app',  // Tu URL de Vercel
    'https://*.vercel.app'  // Permite todas las preview deploys
  ],
  credentials: true
}));
```

---

## 🔧 Opciones para Backend Local

### Opción A: Acceso en tu red WiFi
1. Encuentra tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
2. Configura `VITE_API_URL=http://TU_IP:3001/api` en Vercel
3. Asegúrate que el firewall permita conexiones al puerto 3001

### Opción B: Túnel con ngrok (acceso público temporal)
```bash
# Instalar ngrok
npm install -g ngrok

# Exponer tu backend
ngrok http 3001

# Usar la URL de ngrok en VITE_API_URL
# Ejemplo: https://abc123.ngrok.io/api
```

### Opción C: Cloudflare Tunnel (gratis y persistente)
```bash
# Descargar cloudflared
# https://github.com/cloudflare/cloudflared/releases

# Crear túnel
cloudflared tunnel --url http://localhost:3001

# Usar la URL generada en VITE_API_URL
```

---

## 🎯 Próximos Pasos Recomendados

1. ✅ Desplegar frontend en Vercel (hoy)
2. 🔄 Configurar CORS en backend
3. 🌐 Usar ngrok para pruebas externas
4. 🚀 Desplegar backend en Render (cuando estés listo)

---

## 📝 Comandos Útiles

```bash
# Probar build localmente antes de desplegar
npm run build
npm run preview

# Ver logs en Vercel
vercel logs <deployment-url>

# Desplegar desde CLI (opcional)
npm install -g vercel
vercel
```

---

## 🐛 Troubleshooting

### Error: "API not found" o CORS
- Verifica que `VITE_API_URL` esté configurada correctamente
- Revisa que el backend esté corriendo
- Confirma que CORS incluya tu dominio de Vercel

### Build fallido
- Revisa que todas las dependencias estén en `package.json`
- Verifica que no haya errores de TypeScript: `npm run build`
- Chequea los logs en Vercel Dashboard

### Variables de entorno no funcionan
- Las variables deben empezar con `VITE_`
- Después de cambiarlas, debes hacer **Redeploy**
- No uses comillas en Vercel UI

---

**¡Listo para desplegar!** 🚀
