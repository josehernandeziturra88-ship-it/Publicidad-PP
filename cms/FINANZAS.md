# Finanzas privadas

Control interno del restaurante, con inicio del seguimiento de ventas el
**2026-11-01**, fechas en America/Santiago e importes en pesos chilenos enteros.
No se crean registros ficticios ni cierres futuros. Se permiten compras previas
para preparar costos. La fecha del gasto es la del pago; no hay cuentas por pagar.

## Acceso y activación

`/admin/finanzas.html` y `/admin/api/finance/*` usan la misma verificación RS256,
audiencia y lista de correos del editor. Cloudflare Access debe seguir cubriendo
`/admin` y todas sus subrutas. Los comprobantes nunca se suben a `/media`.

Ejecutar `npm run build:panel` y desplegar `configurar/playero-worker.js` en el
Worker existente, conservando DB, variables y Access. La guía pública de
actualización es `/configurar/finanzas.html`; no contiene registros ni claves.
No se requiere configuración adicional para la entrada manual. Esta versión
**no tiene OCR ni envía facturas a servicios de terceros**.

Las cuatro tablas `finance_records`, `finance_history`, `finance_receipts` y sus
índices se crean de forma idempotente con D1 al abrir una API financiera. No se
modifican las tablas de contenido, imágenes públicas ni sus datos. El despliegue
del sitio GitHub Pages por sí solo no actualiza el Worker de Cloudflare.

## Comportamiento

- Un cierre por fecha con efectivo, tarjeta, transferencia y otros. Un cierre en
  cero cuenta como registrado; la falta de cierre cuenta como pendiente. Los días
  futuros no se pueden completar. Se corrige un cierre por edición, sin anularlo.
- Gastos pagados con proveedor, número, categoría, total y notas. Se permite
  adjuntar un comprobante y detalle de hasta 60 líneas. Los importes finales de
  las líneas deben sumar el total (impuestos, descuentos y cargos incluidos).
- Comprobantes privados de hasta 1,5 MB en D1, archivo de hasta 100 MB. PNG/JPEG/
  WebP/GIF/PDF validados por firma y MIME; fotos grandes convertidas a WebP por el
  navegador. Los originales pequeños se conservan. PDF se descarga como adjunto.
  Un archivo repetido se deduplica por SHA-256; no se puede usar en dos gastos
  activos. Proveedor y número de factura también son únicos entre gastos activos.
- Cantidades hasta tres decimales, kg/g, l/ml y unidades; no se convierte entre
  familias. Cada insumo tiene un costo manual por su unidad de referencia. El
  costo vigente usa primero su última compra vinculada, por fecha y luego última
  modificación. Si el mismo insumo aparece en varias líneas de esa compra, se
  usa el promedio ponderado por cantidad. No hay reconstrucción de inventario ni
  costo histórico al cambiar el mes. Una compra anulada deja de influir.
- Receta por preparación completa: cantidades útiles, merma, otras asignaciones
  de costo y número de porciones. Costo ingrediente = cantidad convertida /
  (1 - merma/100) × costo unitario. Costo por porción = (suma + otros costos) /
  porciones. Margen = precio de referencia - costo; porcentaje sobre venta.
  Insumos sin precio positivo dejan el cálculo incompleto. No cambia el menú.
- Resultado de caja = ventas registradas - gastos pagados del mes. No es utilidad
  neta, no descuenta inventario/costo de ventas ni calcula impuestos pendientes.
- Revisión optimista en cada escritura; conflicto 409 conserva los datos del
  servidor y deja el formulario para revisión. Anulaciones conservan historial y
  comprobantes. Un insumo usado no se elimina. Toda escritura exige mismo Origin.
- CSV mensual compatible con Excel, UTF-8 BOM y separador punto y coma, con días
  pendientes explícitos. Los textos que podrían ejecutar fórmulas se neutralizan.
- JSON de todos los meses, anulados e historial; manifiesto de comprobantes
  **sin bytes**. Guardar también las fotos/PDF y un respaldo/export de D1.
  Todavía no hay importación/restauración desde el JSON en la interfaz.

El límite de 100 MB incluye archivos adjuntos a borradores y gastos anulados;
no se borran automáticamente. La cuota de D1 es compartida con el editor web.
Antes de ampliar volumen, considerar R2 privado y una política explícita de
retención/respaldo. Las credenciales de acceso no se exponen al navegador.

## Comprobación

`npm test` incluye límites de fecha, cifras, autenticación/CSRF, privacidad de
comprobantes, MIME/tamaño, duplicados, concurrencia/revisiones, anulaciones,
promedio ponderado, conversión de unidades, merma, CSV y exportación. Un test con
Miniflare/workerd y D1 real valida BLOB, JSON SQL, índices y control de versiones.

`scripts/check-finance-browser.cjs` prueba el flujo entero en una base local
desechable, jamás producción. Requiere servidor en 127.0.0.1:8789, fecha de prueba
2026-11-03 y DB `:memory:` (PLAYER0_DEV_DB). No cambiar el reloj en producción.
Verifica formularios, compra/foto, receta, actualización de costos, cierres,
persistencia, edición, descargas y ausencia de desbordamiento a 390/1440 px.
