# Administración de El Pollo Playero

La web pública sigue alojada en GitHub Pages. `content/client.js` consulta `https://gestion.elpolloplayero.cl/api/content` y aplica contenido validado. Si el servicio aún no existe, conserva el contenido estático; si dispone de una copia local de la última publicación, puede usarla durante una interrupción. Conviene confirmar precios y disponibilidad por WhatsApp cuando el servicio no esté disponible. Los cambios aparecen al recargar y se consultan también cada 60 segundos con la página abierta.

El panel real y su API están en un Worker independiente, bajo `/admin/`. Cloudflare Access debe proteger esta ruta y sus subrutas. Además de Access, el Worker verifica JWT RS256 con claves del equipo, emisor, audiencia, expiración y lista privada de correos. La edición también valida el origen de la petición. No hay claves, contraseñas ni correos autorizados en el JavaScript público.

## Activación

La guía para el propietario está en `/configurar/panel.html`. El archivo `configurar/playero-worker.js` es un módulo ES compilado y autocontenido para pegar en el editor de Workers. Sus recursos del panel están incluidos. Se requiere:

- D1 enlazado como `DB`.
- Dominio personalizado `gestion.elpolloplayero.cl`.
- Cloudflare Access para `gestion.elpolloplayero.cl/admin` y subrutas; política con el correo autorizado y One-time PIN.
- Variables del Worker: `SITE_ORIGIN`, `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `ADMIN_EMAILS`.

Los valores de Access se obtienen de la aplicación real. `ADMIN_EMAILS` debe configurarse en Cloudflare, preferentemente como secreto. No guardar datos de acceso en este repositorio. Crear una aplicación Access sin configurar las variables del Worker no habilita la edición; el servidor falla cerrado.

### Si Access permite ingresar pero el panel rechaza la sesión

Las respuestas de acceso rechazado incluyen un `code` y un mensaje sin datos de la sesión. No solicitar ni compartir el JWT, cookies o códigos de ingreso. Los códigos permiten revisar la configuración sin desactivar ninguna comprobación:

- `CONFIG_TEAM`, `CONFIG_AUD`, `CONFIG_EMAILS`: falta o es inválida la variable indicada.
- `NO_ASSERTION`: el Worker no recibió la cabecera de Access; revisar el dominio personalizado y la ruta `admin` en minúsculas, con sus subrutas.
- `KEYS_UNAVAILABLE`: no se pudieron consultar las claves del equipo; comprobar el dominio y su disponibilidad.
- `TOKEN_KEY` o `ISSUER_MISMATCH`: el equipo configurado no corresponde a la sesión.
- `AUDIENCE_MISMATCH`: copiar de nuevo el AUD completo de esta aplicación Access a `ACCESS_AUD`.
- `EMAIL_NOT_ALLOWED`: el correo del ingreso debe estar incluido en `ADMIN_EMAILS`.
- `TOKEN_TIME`: iniciar una nueva sesión.
- `TOKEN_FORMAT`, `TOKEN_SIGNATURE` o `AUTH_FAILED`: revisar que la petición pase por Access y solicitar un nuevo ingreso; no omitir la validación.

Si todavía aparece el mensaje genérico antiguo, actualizar el código del Worker desde `/configurar/playero-worker.js` y desplegar. El código no contiene las variables de la cuenta y no modifica la base de datos. Al copiar los valores se toleran espacios y saltos de línea al principio y final del dominio y AUD; la audiencia sigue comparándose de forma exacta después de quitar esos espacios.

La primera lectura crea las tablas y copia `content/default.json` si aún no hay datos. Las publicaciones posteriores incrementan una revisión de forma atómica. Un documento basado en una versión antigua recibe HTTP 409 y no sobrescribe cambios. Se conservan 20 versiones anteriores en D1 y el panel permite descargar el documento en JSON.

Las imágenes se guardan como blobs D1 inmutables de hasta 1.500.000 bytes. Solo se aceptan JPEG, PNG, WebP y GIF con comprobación de firma y tipo. No se admiten SVG subidos. El navegador convierte las imágenes a WebP antes de subirlas. Los nombres de imágenes son UUID y las respuestas llevan `nosniff`, tipo explícito y CSP. La biblioteca tiene un límite de 300 entradas; no se ofrece borrado automático para conservar referencias de respaldos y sesiones en edición.

## Desarrollo y comprobaciones

Requiere Node >=22.13 (SQLite integrado) y las dependencias fijadas en `package-lock.json`:

```sh
npm ci
npm run dev
```

El servidor escucha solo en `127.0.0.1:8788`. Usa SQLite real en `.local/content.sqlite` y una identidad RSA efímera de prueba, generada por `scripts/test-identity.mjs`. Esa identidad únicamente la agrega el servidor de desarrollo local; no forma parte del módulo desplegado ni de su configuración. Las pruebas de servidor comprueban también solicitudes sin identidad o con tokens incorrectos.

```sh
npm test
npm run build:panel
npm run check:worker
node scripts/check-browser.cjs
```

La comprobación de navegador requiere Playwright y Chromium disponibles en el entorno; modifica únicamente la base local. Verifica publicación, vista previa sin publicar, imágenes, disponibilidad, respaldo y diseño móvil/escritorio. Para repetir desde los datos iniciales, detén el servidor y mueve o elimina únicamente `.local/content.sqlite` y sus archivos WAL/SHM; no afecta a D1.

`npm run build:panel` genera el archivo que debe publicarse en Cloudflare. Después de cambios en `cms/ui`, `cms/worker.mjs`, el esquema compartido o el documento inicial, reconstruir ese archivo y actualizar el Worker. Los cambios cotidianos hechos por el propietario se guardan en D1 y no requieren commits.

## Límites del contenido

Los textos se insertan con `textContent`, no como HTML. Los enlaces de WhatsApp solo admiten `https://wa.me/...`; el usuario de Instagram admite únicamente caracteres válidos de un identificador. Las imágenes solo apuntan a `assets/` del sitio o a medios del propio servicio.

Los precios impresos dentro de los afiches no se regeneran al cambiar un precio numérico. El panel señala esta limitación al editar el afiche de portada. Reemplazar la imagen si cambia su texto impreso.

Activar Cloudflare DNS no despliega el Worker. La publicación de este repositorio tampoco crea D1 ni una aplicación Access. No considerar el panel operativo hasta comprobar inicio de sesión real y persistencia en la cuenta de Cloudflare.
