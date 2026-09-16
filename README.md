# Mis notas · espacio de notas estilo Notion (100% gratis)

Una página web de notas estilo **Notion**, completamente gratuita y sin cuentas.
Funciona en **móvil y ordenador**, se adapta a cada pantalla y no necesita servidor:
es HTML + CSS + JavaScript puro (cero dependencias, cero costes).

![Vista previa](icon-512.png)

## ✨ Características

- **Editor por bloques** (como Notion): escribe `/` para insertar títulos, listas,
  tareas, citas, destacados, código, imágenes por URL o divisores.
- **Páginas** con icono de emoji, búsqueda global y menú lateral.
- **Atajos de teclado**: `Enter` bloque nuevo · `Shift+Enter` salto de línea ·
  `Backspace` al inicio une bloques · `Tab`/`Shift+Tab` indenta listas ·
  `Ctrl/⌘+K` busca.
- **Modo claro/oscuro** (sigue la preferencia del sistema y se puede cambiar).
- **Responsive**: en móvil el menú lateral se desliza como en una app nativa.
- **Guardado automático** en el navegador (`localStorage`), sin servidores.
- **Exportar / Importar** en JSON para respaldar tus notas o pasarlas a
  otro dispositivo.
- **PWA básica**: se puede "añadir a pantalla de inicio" desde el navegador.

## 📂 Estructura

```
index.html            → estructura de la página
styles.css            → estilos (tema claro/oscuro, responsive)
app.js                → toda la lógica (editor, bloques, páginas, menús)
manifest.webmanifest  → para instalarla como app
icon-512.png          → icono
```

## 🚀 Ejecutar localmente

No hay nada que instalar ni compilar. Solo abre `index.html` en el navegador,
o si prefieres servirlo:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## ☁️ Despliegue gratis (GitHub Pages)

1. Ve a **Settings → Pages** del repositorio.
2. En *Build and deployment* elige **Source: Deploy from a branch**,
   rama `main` (o la rama donde esté el código) y carpeta `/ (root)`.
3. Guarda y espera ~1 minuto. Tu página estará publicada en
   `https://<tu-usuario>.github.io/<repo>/` — gratis, con HTTPS y accesible
   desde cualquier lugar.

## 🔒 Privacidad

Tus notas **no salen de tu dispositivo**: se guardan en el `localStorage`
del navegador. Para moverlas a otro dispositivo usa **⋯ → Exportar**
y en el otro dispositivo **⋯ → Importar**.
