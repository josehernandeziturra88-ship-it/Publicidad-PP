# Compras, costos, cuentas y tarjetas

Control privado del negocio y los gastos personales desde **2026-10-25**, con fechas de
America/Santiago y pesos chilenos enteros. No se crean ventas ni saldos ficticios.
Se conservan registros de v1: compras sin reparto siguen siendo del negocio;
registros sin cuenta cuentan en informes, pero no cambian saldos bancarios.

## Actualización y acceso

`npm run build:panel` produce `configurar/playero-worker.js`. Actualizar el
**Worker existente playero-gestion**, conservando DB, variables y Cloudflare
Access para `/admin` y todas sus subrutas. GitHub Pages publica los archivos y
la guía `/configurar/finanzas.html`; no despliega el Worker del panel.

- `/admin/finanzas.html`: comprobantes, reparto, costos, recetas y cierres.
- `/admin/cuentas.html`: dashboard aparte de cuentas, tarjetas y movimientos.
- `/admin/api/finance/*`: API privada con firma RS256, audiencia y correo permitido.

Tablas e índices se crean de forma idempotente. No hay reemplazos de tablas ni
cambios al contenido publicado. Todas las escrituras requieren mismo Origin.
Control de revisiones: 409 si otra sesión ya editó. Anulaciones conservan historial
y comprobantes. Una cuenta utilizada no se elimina ni cambia de tipo/fecha inicial.

## Facturas mixtas y costos

Cada comprobante se guarda una vez. Cada línea tiene cantidad total, cantidad
para negocio, unidad e importe final. La parte personal es el resto. El importe
del negocio se redondea al peso proporcionalmente a su cantidad y la diferencia
queda en la parte personal. Sin detalle se elige negocio o personal; una compra
mixta exige líneas. Sus importes deben sumar el total del comprobante.

El botón para repartir IVA/descuentos distribuye proporcionalmente la diferencia,
tras confirmación. No decide si el impuesto es recuperable. Fecha del comprobante
se usa para precios y fecha de pago/cargo para registros financieros.

Los insumos se vinculan solo a cantidades del negocio. Los costos usan su última
compra válida, con fecha de edición como desempate. Una línea totalmente personal
no cambia costos. Si un insumo aparece varias veces en una compra, se usa promedio
ponderado sin redondear su precio unitario. Se muestran hasta 20 compras recientes
por insumo. Sin compra vinculada se usa costo manual.

Unidades: kg/g, l/ml y unidades; cantidades hasta 3 decimales. No se convierte una
caja a kg sin conocer su contenido. Recetas: cantidad útil / (1-merma/100) × costo
unitario, más otros costos de preparación, dividido por porciones. Margen sobre
precio de referencia, que no cambia el menú público. No hay inventario perpetuo,
costo histórico de ventas ni cálculo de utilidad tributaria.

## Cuentas y tarjetas

Tipos: banco/débito, efectivo y crédito. Ámbito negocio/personal, nombre, banco
opcional y últimos 4 dígitos opcionales. Nunca se solicitan número completo, CVV
ni credenciales. Se admite una imagen opcional por cuenta/tarjeta, almacenada en
el archivo financiero privado (nunca /media). Solo se permiten referencias a
imágenes válidas, no PDF. Se muestra en la ficha y se puede cambiar o quitar.
El usuario elige un logo o una foto con datos sensibles previamente tapados; no
se realiza redacción automática. La selección usa un botón explícito, selector
nativo alternativo y soporte de arrastrar/pegar imágenes. Acepta imágenes de la
galería; si createImageBitmap no está disponible, usa decodificación Image del
navegador. Los formatos no decodificables solicitan JPG/PNG. El archivo se
convierte a WebP (o el formato compatible del navegador) antes de subirlo. Comparte el límite de 100 MB y se conserva en el
historial al quitarla. Se ingresa el saldo al **comenzar** una fecha y luego sus movimientos.
Crédito: deuda positiva o saldo a favor negativo; cupo y días de pago/facturación.

Saldos hasta el menor entre fin del mes seleccionado y hoy:

| Movimiento | Banco / efectivo | Crédito |
| --- | --- | --- |
| Compra / gasto | baja saldo | sube deuda |
| Ingreso | sube saldo | baja deuda |
| Transferencia saliente | baja saldo | sube deuda (avance) |
| Transferencia entrante | sube saldo | baja deuda (pago) |
| Ajuste positivo | sube saldo | sube deuda |

Transferencias, pagos de tarjetas y ajustes no crean ingresos/gastos nuevos.
Cupo disponible = cupo - deuda. El próximo día de pago se adapta a meses cortos,
pero no es monto facturado ni cartola bancaria. No hay sincronización con bancos.

Ventas: un cierre por fecha desde 2026-10-25, con cuenta de destino por medio de
pago. Cero registrado se distingue de un día pendiente; no hay fechas futuras.
Ventas se asignan a banco o efectivo, nunca crédito propio. Otros ingresos van
aparte. Una compra mixta mueve una vez el total en su cuenta y reparte informes.

Los filtros de cuentas usan propietario y los gastos usan destino. Una compra
personal con la cuenta del negocio baja esa cuenta sin ser gasto del negocio.
El resultado registrado incluye compras con crédito; no es caja ni utilidad neta.

## CSV

Plantilla descargable. Obligatorios `fecha`, `descripcion`, `monto`; opcionales
`destino`, `categoria`, `tipo`, `referencia`. Fechas ISO o dd/mm/aaaa, montos
enteros sin separadores: negativos gastos, positivos ingresos. Separador ;,
tabulador o coma y comillas CSV. Máximo 100 filas / 300 kB. El usuario revisa
cada tipo/destino/categoría y puede omitir filas.

Pagos de tarjetas, transferencias, ventas ya cerradas y compras ya ingresadas se
deben omitir y reconciliar manualmente. No reconoce el formato de todos los bancos.
Una referencia de la misma cuenta ya importada se omite. Sin referencia se usa
fecha/descripción/monto/ordinal de repetición. Evita reimportar la misma planilla,
pero no reconoce todos los duplicados con registros manuales o cartolas distintas.
Revisar movimientos idénticos legítimos sin referencias bancarias únicas.

Lotes atómicos de 10 filas para respetar consultas por invocación de D1 Free.
Si falla un lote posterior, los anteriores se conservan y se informa el número.
Reintentar omite referencias ya guardadas. Marcadores durables evitan duplicación
por solicitudes simultáneas y se conservan tras anular un registro importado.

## Lectura de fotos con Workers AI

Añadir binding **Workers AI** llamado **AI** al Worker. Wrangler ya lo declara.
No exige API keys en el código. Sin binding, la entrada manual y el resto del
panel siguen disponibles.

Modelo `@cf/meta/llama-3.2-11b-vision-instruct`, mensajes con imagen data URI,
3072 tokens de salida, temperatura 0. Foto JPG/PNG/WebP hasta 1,5 MB. PDF es respaldo
con entrada manual o foto adicional. Solo se llama al modelo al pulsar Leer foto.
Consume cuota Workers AI de la cuenta: máximo propio **10 lecturas nuevas al día
chileno**; fallos también consumen intento porque pueden haber usado inferencia.
Borradores exitosos cacheados por comprobante no solicitan otra lectura.

La salida es solo un borrador acotado: no crea gastos, no clasifica negocio/personal,
no ejecuta instrucciones en la foto. El usuario aplica el borrador, revisa y
guarda explícitamente. Cantidades/importes ilegibles quedan vacíos. No se garantiza
precisión ni interpretación de cajas, IVA o descuentos. No se envían credenciales,
cuentas ni otros registros al modelo; los fallos no exponen respuestas internas.

Fuentes oficiales verificadas:
- [Modelo y esquema de mensajes](https://developers.cloudflare.com/workers-ai/models/llama-3.2-11b-vision-instruct/).
- [Bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/).
- [Precios y cuotas](https://developers.cloudflare.com/workers-ai/platform/pricing/):
  cuota gratuita de 10.000 neuronas diarias; exceso según plan. Diez lecturas no
  garantizan por sí solas consumo gratis; la cuota se comparte con otros usos.

No se pudo ejecutar una lectura contra la cuenta real en esta sesión: faltan
credenciales de despliegue y acceso a su binding AI. Contrato, revisión, caché,
límites y fallos se probaron con servicio simulado. Completar activación con una
factura real tras desplegar.

## Comprobantes y respaldo

Archivos privados en D1, nunca `/media`; firma MIME, no-store y PDF como adjunto.
Hasta 1,5 MB por archivo y 100 MB en total, incluyendo borradores/anulados. Fotos
grandes optimizadas por navegador. SHA-256 deduplica archivos; índices impiden
duplicar un archivo o número/proveedor entre gastos activos. Comparten cuota D1
con el editor; para más volumen usar almacenamiento privado separado con respaldo.

CSV neutraliza fórmulas en textos. JSON `playero-finance-v2` incluye todos los
meses, cuentas, movimientos, anulados, historial, marcadores y manifiesto de
comprobantes, **no bytes de fotos/PDF**. Conservar archivos y respaldo de D1.
No hay restauración JSON en la interfaz.

## Verificación local

`npm test` cubre autenticación/CSRF, fechas, revisiones, reparto, crédito,
transferencias, ajustes, CSV, duplicados, borradores/caché/límite AI y privacidad.
Miniflare/workerd usa D1 real para BLOB, JSON SQL, historial, cuentas e importación.

En terminales separadas, con base nueva por ejecución:

```sh
node scripts/finance-test-server.mjs finance
node scripts/check-finance-browser.cjs
```

```sh
node scripts/finance-test-server.mjs wallet
node scripts/check-wallet-browser.cjs
```

Servidores con fechas fijas, base :memory: y localhost, nunca importados por el
Worker publicado. La prueba visual OCR simula la respuesta en Playwright, sin
modelo externo ni factura real.

`node scripts/check-card-picker.cjs` verifica apertura real del selector, toque,
fallback sin showPicker/createImageBitmap, selector alternativo, arrastrar y
pegar, con persistencia después de guardar/recargar. Usa el servidor wallet.

## Encuadre y diseño de tarjetas

Las cuentas con imagen usan una superficie con proporción de tarjeta bancaria,
imagen de fondo y degradado para mantener legibles nombre, banco y saldo.
Editar permite llenar/mostrar completa, zoom 100–300 %, posición X/Y y giro
de 90 grados. Solo se guardan parámetros; se conserva el archivo privado original.
Se validan escala, posiciones, ajuste y rotación en el servidor. Los registros
anteriores usan valores predeterminados y la imagen existente.

`node scripts/check-card-layout.cjs`, con servidor wallet nuevo, prueba controles,
giro sin deformación, persistencia, saldos, banco/crédito y límites visuales a
320/390/1440 px. Sus imágenes y saldos de ejemplo son ficticios.


## Colores por tarjeta

Editar → Diseño de la tarjeta permite seleccionar Color o Imagen, siete colores
predefinidos y un selector de color personalizado con vista previa. `cardColor`
acepta únicamente HEX de seis dígitos o vacío (imagen/diseño anterior). No requiere
migrar tablas. Un color tiene prioridad visual sobre la imagen, pero conserva
`imageId` y el archivo privado para volver a usarlo. Las cuentas anteriores
mantienen sus imágenes; las nuevas comienzan con un fondo azul marino. Subir una
imagen activa su fondo; quitarla activa el color seleccionado.

Los fondos de color conservan disponible blanco a la izquierda y deuda roja
pequeña a la derecha, proporción y distribución de tres columnas. Un degradado
oscuro mantiene legibilidad incluso con colores claros. Cambiar el aspecto no
modifica saldos, cupos ni movimientos.


## Lista de gastos del negocio

Compras y costos → Gastos y facturas muestra solo comprobantes con importe del
negocio mayor que cero. En facturas mixtas, la lista muestra únicamente ese
importe y las identifica como mixtas; Ver / editar conserva el comprobante
completo y su reparto. El contador del resumen usa el mismo filtro. Los gastos
personales permanecen guardados y accesibles desde el dashboard de cuentas,
incluidos sus enlaces de edición. No se alteran cargos, saldos ni el respaldo.


## Acceso desde el inicio del iPhone

Las tres páginas del panel declaran apple-touch-icon, favicon PNG, título corto,
theme-color y modo web app de Safari. Usan el logo existente (PNG 512×512) de
`assets/playero-app-icon.png`, publicado en el sitio público y enlazado por HTTPS,
para que iOS pueda descargar la marca sin autenticarse en el panel. El icono
no incluye datos financieros ni cambia las reglas de Cloudflare Access. No hay
service worker ni caché local de datos privados. Actualizar el Worker, recargar
en Safari y volver a agregar el acceso si el icono anterior sigue guardado.
