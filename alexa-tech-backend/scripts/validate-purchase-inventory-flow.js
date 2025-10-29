#!/usr/bin/env node
'use strict';

// Config via env (all optional)
// API_BASE: defaults to http://localhost:3001/api
// EMAIL: defaults to supervisor@alexatech.com
// PASSWORD: defaults to supervisor123
// WAREHOUSE_CODE: defaults to WH-PRINCIPAL
// PRODUCT_CODE: defaults to WC-006; if not found, picks first
// DO_ADJUST: if 'true', performs an optional -1 adjustment and prints kardex

const API_BASE = process.env.API_BASE || 'http://localhost:3001/api';
const EMAIL = process.env.EMAIL || 'supervisor@alexatech.com';
const PASSWORD = process.env.PASSWORD || 'supervisor123';
const WAREHOUSE_CODE = process.env.WAREHOUSE_CODE || 'WH-PRINCIPAL';
const PRODUCT_CODE = process.env.PRODUCT_CODE || 'WC-006';
const DO_ADJUST = String(process.env.DO_ADJUST || 'false').toLowerCase() === 'true';

const headers = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function req(method, path, body, token) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: headers(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    const msg = json?.message || res.statusText;
    throw new Error(`HTTP ${res.status} ${method} ${path}: ${msg}\n${text}`);
  }
  return json;
}

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function main() {
  console.log(`[Config] API_BASE=${API_BASE}`);
  console.log(`[Config] EMAIL=${EMAIL} WAREHOUSE=${WAREHOUSE_CODE} PRODUCT_CODE=${PRODUCT_CODE} DO_ADJUST=${DO_ADJUST}`);

  // 1) Login
  const login = await req('POST', '/auth/login', { email: EMAIL, password: PASSWORD });
  const token = login?.data?.accessToken;
  if (!token) throw new Error('Login OK pero sin accessToken. Verificar auth.');
  console.log(`[Login] OK. token len=${String(token).length}`);

  // 2) Providers
  const providersResp = await req('GET', '/entidades?tipo=Proveedor&limit=50', null, token);
  const provider = (providersResp?.data?.clients || []).find((c) => String(c.tipoEntidad) === 'Proveedor')
                  || (providersResp?.data?.clients || [])[0];
  if (!provider?.id) throw new Error('No hay proveedor válido. Ejecuta seed o crea uno.');
  console.log(`[Proveedor] Elegido: ${provider.razonSocial || provider.nombres || provider.id} (${provider.id})`);

  // 3) Products
  const productsResp = await req('GET', '/productos?limit=50', null, token);
  let product = (productsResp?.data?.products || []).find((p) => String(p.codigo) === PRODUCT_CODE)
               || (productsResp?.data?.products || [])[0];
  if (!product) throw new Error('No hay productos disponibles. Ejecuta seed o crea uno.');
  console.log(`[Producto] Elegido: ${product.nombre} (codigo=${product.codigo} id=${product.id}) precio=${product.precioVenta}`);

  // 4) Stock before
  const stockBeforeResp = await req('GET', `/inventario/stock?almacenId=${encodeURIComponent(WAREHOUSE_CODE)}&q=${encodeURIComponent(product.codigo)}`, null, token);
  const stockBeforeRow = (stockBeforeResp?.data?.rows || [])[0];
  console.log(`[Stock Antes] codigo=${product.codigo} almacen=${WAREHOUSE_CODE} cantidad=${stockBeforeRow?.cantidad ?? 0}`);

  // 5) Create purchase (items[].productoId usa el CODIGO del producto)
  const purchasePayload = {
    proveedorId: provider.id,
    almacenId: WAREHOUSE_CODE,
    fechaEmision: todayYYYYMMDD(),
    fechaEntregaEstimada: todayYYYYMMDD(),
    tipoComprobante: 'Factura',
    formaPago: 'Efectivo',
    descuento: 0,
    items: [
      {
        productoId: String(product.codigo), // importante: el backend espera codigo aquí
        nombreProducto: String(product.nombre),
        cantidad: 2,
        precioUnitario: Number(product.precioVenta || 10),
      },
    ],
    observaciones: 'Script validación inventario',
  };
  const createResp = await req('POST', '/compras', purchasePayload, token);
  if (!createResp?.data?.id) throw new Error('La creación de compra no devolvió ID');
  const purchaseId = createResp.data.id;
  const purchaseCode = createResp.data.codigoOrden;
  console.log(`[Compra] Creada id=${purchaseId} codigo=${purchaseCode} estado=${createResp.data.estado}`);

  // 6) Stock after create (debería igual que antes)
  const stockAfterCreateResp = await req('GET', `/inventario/stock?almacenId=${encodeURIComponent(WAREHOUSE_CODE)}&q=${encodeURIComponent(product.codigo)}`, null, token);
  const stockAfterCreateRow = (stockAfterCreateResp?.data?.rows || [])[0];
  console.log(`[Stock Post-Crear] cantidad=${stockAfterCreateRow?.cantidad ?? 0} (esperado sin cambio)`);

  // 7) Patch status → Recibida (aplica entrada de inventario)
  const statusResp = await req('PATCH', `/compras/${encodeURIComponent(purchaseId)}/status`, { estado: 'Recibida' }, token);
  console.log(`[Compra] Status actualizado: estado=${statusResp?.data?.estado}`);

  // 8) Stock after recibida (+2)
  const stockAfterResp = await req('GET', `/inventario/stock?almacenId=${encodeURIComponent(WAREHOUSE_CODE)}&q=${encodeURIComponent(product.codigo)}`, null, token);
  const stockAfterRow = (stockAfterResp?.data?.rows || [])[0];
  console.log(`[Stock Post-Recibida] cantidad=${stockAfterRow?.cantidad ?? 0} (esperado +2)`);

  // 9) Kardex ENTRADA
  const kardexResp = await req('GET', `/inventario/kardex?warehouseId=${encodeURIComponent(WAREHOUSE_CODE)}&q=${encodeURIComponent(product.codigo)}`, null, token);
  const entrada = (kardexResp?.data?.rows || []).find((r) => String(r.tipo) === 'ENTRADA');
  if (entrada) {
    console.log('[Kardex ENTRADA] ', JSON.stringify(entrada, null, 2));
  } else {
    console.log('[Kardex ENTRADA] No encontrada');
  }

  // 10) Optional: manual adjustment -1
  if (DO_ADJUST) {
    const ajPayload = {
      productId: product.id, // aquí sí va el ID del producto
      warehouseId: WAREHOUSE_CODE,
      cantidadAjuste: -1,
      adjustmentReason: 'MermaDanio',
      observaciones: 'Script ajuste -1',
    };
    const ajResp = await req('POST', '/inventario/ajustes', ajPayload, token);
    console.log('[Ajuste] ', JSON.stringify(ajResp?.data || ajResp, null, 2));
    const kardex2 = await req('GET', `/inventario/kardex?warehouseId=${encodeURIComponent(WAREHOUSE_CODE)}&q=${encodeURIComponent(product.codigo)}`, null, token);
    const last = (kardex2?.data?.rows || [])[0];
    console.log('[Kardex Último] ', JSON.stringify(last, null, 2));
  }

  console.log('\n[Resumen] OK: flujo completado.');
}

main().catch((err) => {
  console.error('[Error Script]', err?.message || err);
  process.exitCode = 1;
});