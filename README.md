# El Pollo Playero

Web estática adaptable a celulares. Incluye 6 promociones, menú de comida, jugos naturales, helados Savory, ubicación y contacto.

## Ver la web

Abre `index.html` en un navegador, o ejecuta desde esta carpeta:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

No necesita instalar dependencias. Publicación automática con GitHub Pages desde `main`. Para otro hosting estático, incluye `index.html`, los tres archivos CSS, `menu.js`, `icecream.js` y la carpeta `assets`, conservando sus rutas.

## Datos utilizados

- Instagram: https://www.instagram.com/elpolloplayero__/
- WhatsApp: https://wa.me/message/WHQBDDPZZZSKD1
- Dirección: Av. Isidoro Dubornais 0665, Quisco Norte, El Quisco, Región de Valparaíso.
- Atención: lunes a domingo. Las horas específicas se consultan por WhatsApp.
- Productos y precios transcritos de las imágenes proporcionadas.
- Google Maps busca la dirección; no se han inferido coordenadas.

## Imágenes y fuentes

La portada, los jugos, el logo y Savory utilizan los archivos subidos por el usuario a `assets`. Las seis fotos de promociones se editaron con la herramienta de imágenes para quitar el fondo y se muestran desde `assets/platos-sin-fondo.png`, con encuadres SVG y altura uniforme. Los afiches originales se conservan. Las cartas Savory se muestran completas y se pueden ampliar; sus precios no están completados y se consultan por WhatsApp. No hay fotos individuales para las otras categorías del menú. La fuente se carga desde Google Fonts, con alternativas del sistema.

La web no procesa pagos ni confirma pedidos automáticamente. Los pedidos y consultas se realizan por WhatsApp o Instagram. Generar estos archivos no publica el sitio ni crea un dominio público.

La sección de helados presenta una franja animada con 24 marcas, usando los logos de las cartas originales mediante encuadres SVG. El movimiento se puede pausar y respeta la preferencia de movimiento reducido. Las dos cartas se muestran al abrir «Ver variedades», mediante un desplegable nativo que funciona sin JavaScript.
