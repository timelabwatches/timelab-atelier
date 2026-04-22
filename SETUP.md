# 🚀 Guía rápida de despliegue — TIMELAB Atelier

Esta guía te lleva de cero a tener el CRM online y sincronizado en **20 minutos**.

Tienes **tres caminos** para subir a GitHub. Elige el que te resulte más cómodo:

- **Camino A**: Subir desde la web de GitHub (sin instalar nada) ← recomendado si nunca has usado git
- **Camino B**: Con GitHub Desktop (interfaz gráfica)
- **Camino C**: Con terminal y `git` (si ya sabes lo que haces)

---

## 📋 Antes de empezar: descarga y descomprime

1. Descarga `timelab-atelier.zip`
2. Descomprímelo. Te quedará una carpeta `timelab-app/` con 18 archivos y carpetas.
3. Verifica que dentro ves: `src/`, `public/`, `apps-script/`, `.github/`, `package.json`, `index.html`, `README.md`

---

## 🅰️ Camino A — Subir desde la web de GitHub (sin instalar nada)

### Paso 1: Crea cuenta de GitHub si no tienes

👉 [github.com/signup](https://github.com/signup) — es gratis.

### Paso 2: Crea un repositorio nuevo

1. Pulsa el botón verde **"New repository"** o ve a [github.com/new](https://github.com/new)
2. Nombre: `timelab-atelier` (puedes cambiarlo, pero recuerda el nombre — se usa en la URL final)
3. Dejar en **Public** (si lo pones en Private, Pages gratuito no funciona)
4. **NO marques** "Add a README" ni nada más. Déjalo vacío.
5. Pulsa **"Create repository"**

### Paso 3: Sube los archivos arrastrando

1. En la página del repo recién creado, verás un enlace que dice **"uploading an existing file"** — púlsalo.
2. Selecciona **TODOS** los archivos y carpetas dentro de `timelab-app/` (no la carpeta `timelab-app/` en sí, su contenido).
   - En Windows: abre la carpeta, Ctrl+A, arrastra a la ventana del navegador
   - En Mac: abre la carpeta, Cmd+A, arrastra a la ventana del navegador
   - ⚠️ **IMPORTANTE**: asegúrate de que se suben también las carpetas ocultas `.github/` y el archivo `.gitignore`. Si no las ves, activa "Mostrar archivos ocultos" en tu sistema.
3. En el campo "Commit message" escribe algo como `Initial commit`
4. Pulsa **"Commit changes"**

### Paso 4: Activa GitHub Pages

1. Ve a la pestaña **Settings** del repo (no la de tu cuenta, la del repo)
2. En el menú izquierdo, pulsa **Pages**
3. En "Source", selecciona **GitHub Actions** (NO "Deploy from a branch")
4. Guarda

### Paso 5: Espera el despliegue

1. Ve a la pestaña **Actions** del repo
2. Verás un workflow ejecutándose. Espera 1-2 minutos a que termine con el icono verde ✅
3. Si falla ❌, haz clic encima para ver el error (lo más común: faltó algún archivo — reintenta el paso 3)

### Paso 6: Abre tu CRM

Tu URL es: **`https://TU_USUARIO.github.io/timelab-atelier/`**

Ejemplo: si tu usuario de GitHub es `josebahidalgo`, tu URL sería `https://josebahidalgo.github.io/timelab-atelier/`

Ábrela en el móvil. Debería cargar el CRM con todos los datos del 2T.

---

## 🅱️ Camino B — Con GitHub Desktop (interfaz gráfica)

### Paso 1: Instala GitHub Desktop

👉 [desktop.github.com](https://desktop.github.com) — gratis, para Mac y Windows

Al instalarlo, inicia sesión con tu cuenta de GitHub.

### Paso 2: Crea repositorio desde la carpeta

1. En GitHub Desktop: **File → Add local repository** → selecciona la carpeta `timelab-app/`
2. Te pedirá crear el repositorio porque aún no es git → acepta
3. **File → Publish repository**
4. Nombre: `timelab-atelier`
5. Desmarca "Keep this code private"
6. Pulsa **Publish**

### Paso 3: Configura Pages

Sigue los pasos 4, 5 y 6 del Camino A. Ya está online.

---

## 🅲️ Camino C — Con terminal (para los que ya usan git)

```bash
cd ruta/a/timelab-app
git init
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/timelab-atelier.git
git push -u origin main
```

Luego configura Pages (pasos 4-6 del Camino A).

---

## 🔗 Conectar CRM con tu Google Sheet

Una vez tengas el CRM online, necesitas configurar el backend para sincronización.

### Paso 1: Prepara tu Google Sheet

1. Abre tu Google Sheet actual (la contabilidad TIMELAB)
2. Ve a **Extensiones → Apps Script**
3. Se abre el editor de scripts. Borra todo el código que haya.
4. Copia **todo** el contenido del archivo `apps-script/Code.gs` del proyecto y pégalo.

### Paso 2: Configura el token

En la línea 13 del script pegado:

```js
const TOKEN = "CAMBIA_ESTO_POR_UN_TOKEN_LARGO_Y_ALEATORIO_abc123xyz";
```

**Reemplázalo** por algo único. Sugerencia: abre [passwordsgenerator.net](https://passwordsgenerator.net/) y genera una cadena de 32+ caracteres. Ejemplo:

```js
const TOKEN = "Xk9mP2vQ8fL5nR7wT3bY6hJ4cG1aS0dF";
```

**Guárdalo en un lugar seguro** (bloc de notas, 1Password, lo que uses). Lo necesitarás.

### Paso 3: Ejecuta setup()

1. En el editor de Apps Script, en el dropdown de funciones arriba, selecciona **`setup`**
2. Pulsa **Ejecutar** (botón ▶️)
3. Google te pedirá permisos:
   - "Revisar permisos" → selecciona tu cuenta
   - Puede salir "Google no ha verificado esta aplicación" → pulsa **Avanzado → Ir a ... (no seguro)** — es tu propio script, es seguro
   - Acepta los permisos (necesita acceso a Sheets y Drive)
4. Verás un log: `Setup complete. Deploy as Web App now.`

Esto crea las hojas vacías en tu Sheet y una carpeta `TIMELAB-Fotos` en tu Drive.

### Paso 4: Despliega como Web App

1. Pulsa el botón **Implementar** (arriba a la derecha) → **Nueva implementación**
2. Si es la primera vez, pulsa el icono del engranaje ⚙️ y selecciona **Aplicación web**
3. Rellena:
   - Descripción: `TIMELAB CRM API`
   - Ejecutar como: **Yo** (tu email)
   - Quién tiene acceso: **Cualquier usuario** ⚠️ (sí, aunque suene inseguro — el token lo protege)
4. Pulsa **Implementar**
5. **COPIA LA URL** que aparece (termina en `/exec`). Ejemplo: `https://script.google.com/macros/s/AKfy.../exec`

### Paso 5: Pega las credenciales en tu CRM

1. Abre tu CRM en el móvil (`https://TU_USUARIO.github.io/timelab-atelier/`)
2. Toca el icono del reloj arriba a la derecha → te lleva a **Ajustes**
3. En **"Sincronización nube"**:
   - Pega la URL del Apps Script
   - Pega el token que definiste
   - Pulsa **Guardar**
   - Pulsa **Probar** → debería decir `✓ Conexión OK`
4. Pulsa **Push local → nube** para subir por primera vez los datos del 2T a tu Sheet

A partir de este momento, cualquier cambio en el CRM se sincroniza **automáticamente 3 segundos después**.

---

## 📱 Instalar como app en el móvil

### iPhone / iPad
1. Abre la URL del CRM en **Safari** (no Chrome)
2. Pulsa el botón Compartir (cuadrado con flecha ↗)
3. **Añadir a pantalla de inicio**

### Android
1. Abre la URL en **Chrome**
2. Menú ⋮ → **Instalar aplicación**

Ahora tienes un icono en la pantalla de inicio que abre el CRM como si fuera una app nativa.

---

## 🔄 Actualizar el CRM en el futuro

Si te entrego una nueva versión:

**Camino A (web)**:
1. Ve a tu repo en GitHub
2. Navega al archivo que cambió (ej. `src/App.jsx`)
3. Pulsa el lápiz ✏️ para editarlo
4. Pega el nuevo contenido, pulsa "Commit changes"
5. GitHub Actions desplegará la nueva versión automáticamente en 1-2 min

**Camino B/C**:
- GitHub Desktop: copia el archivo nuevo encima, commit & push
- Terminal: `cp nuevo-App.jsx src/App.jsx && git add -A && git commit -m "update" && git push`

---

## 🛠️ Solución de problemas

### "GitHub Actions workflow failed"
- Ve a Actions → pulsa el workflow fallido → ve el error
- Causa más común: se subió mal alguna carpeta. Reintenta subiendo el ZIP descomprimido entero.

### "404 Page not found" al abrir la URL del CRM
- Espera 2-3 minutos después del primer despliegue
- Verifica que en Settings → Pages aparece "Your site is live at..."
- Asegúrate de incluir la barra final: `https://tuusuario.github.io/timelab-atelier/` (con `/` al final)

### "El CRM abre pero Probar Conexión falla"
- Verifica que copiaste la URL del Apps Script **completa** (debe terminar en `/exec`)
- Verifica que el token del CRM es **idéntico** al del Apps Script (sin espacios extra)
- Si cambiaste el token del Apps Script, tienes que hacer **Nueva implementación** (no basta con Guardar)

### "Las fotos no se suben a Drive"
- Probable que falte ejecutar `setup()` en Apps Script — vuelve al paso 3 de la sección Google Sheet
- O que la carpeta `TIMELAB-Fotos` se haya borrado manualmente — vuelve a crearla

### "Los datos del CRM se ven pero no coinciden con mi Sheet"
- Primera vez: pulsa **Push local → nube** desde Ajustes del CRM, esto escribe los datos semilla en tu Sheet
- Después: cualquier edición en el CRM se refleja en el Sheet automáticamente
- Si editaste manualmente el Sheet: pulsa **Pull nube → local** para traer esos cambios al CRM

---

## ❓ FAQ rápido

**¿Todo esto es gratis?** Sí. GitHub Pages, Apps Script y Drive tienen cuotas gratuitas más que suficientes para TIMELAB.

**¿Puedo cambiar el diseño o añadir funciones?** Sí, el código está en `src/App.jsx`. Si me pides cambios, te genero un `App.jsx` nuevo que sustituyes en el repo.

**¿Y si quiero que sea privado?** GitHub Pages gratuito requiere repo público. Si pagas GitHub Pro ($4/mes) puedes tenerlo privado. Alternativa: aunque el código sea público, tu URL es `tuusuario.github.io/timelab-atelier/` que nadie va a adivinar, y tu Sheet está protegida por el token secreto.

**¿Puedo usar esto desde varios dispositivos a la vez?** Sí, con la sincronización activa. Si editas desde dos sitios a la vez, el último en guardar gana ("last write wins"). No es problema si no editas simultáneamente.

**¿Qué pasa si pierdo internet?** El CRM sigue funcionando con los datos locales del dispositivo. Cuando recupera red, sincroniza automáticamente.
