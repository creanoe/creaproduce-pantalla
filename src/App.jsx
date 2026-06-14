import React, { useEffect, useState } from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, errorInfo: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorInfo: error.message }; }
  componentDidCatch(error, errorInfo) { console.error("Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return (<div className="p-10 bg-rose-50 min-h-screen flex justify-center items-center"><div className="bg-white p-8 rounded-3xl shadow-xl"><h1 className="text-3xl font-black text-rose-600">🚨 Error</h1><pre className="mt-4">{this.state.errorInfo}</pre><button onClick={()=>window.location.reload()} className="mt-4 bg-rose-600 text-white px-4 py-2 rounded">Recargar</button></div></div>);
    return this.props.children; 
  }
}

// ☁️ CONEXIÓN A LA NUBE ☁️
const API_URL = "https://creadesign-backend.onrender.com";

// TU CATÁLOGO BASE
const CATALOGO_CREADESIGN = [
  { codigo: 'ADH-01', nombre: 'Adhesivo Brillante', categoria: 'Adhesivos', unidad: 'Metro' },
  { codigo: 'ADH-02', nombre: 'Adhesivo Opaco / Mate', categoria: 'Adhesivos', unidad: 'Metro' },
  { codigo: 'ADH-03', nombre: 'Adhesivo Transparente', categoria: 'Adhesivos', unidad: 'Metro' },
  { codigo: 'ADH-04', nombre: 'Adhesivo Microperforado', categoria: 'Adhesivos', unidad: 'Metro' },
  { codigo: 'ADH-05', nombre: 'Adhesivo Troquelado', categoria: 'Adhesivos', unidad: 'Metro' },
  { codigo: 'TBAN-01', nombre: 'Tela Banner (PVC)', categoria: 'Lonas', unidad: 'Metro' },
  { codigo: 'TBAN-02', nombre: 'Tela Mesh (Perforada)', categoria: 'Lonas', unidad: 'Metro' },
  { codigo: 'TBAN-03', nombre: 'Tela Canvas', categoria: 'Lonas', unidad: 'Metro' },
  { codigo: 'TBAN-04', nombre: 'Tela Panaflex', categoria: 'Lonas', unidad: 'Metro' },
  { codigo: 'TBAN-05', nombre: 'Tela Bandera traslucida', categoria: 'Lonas', unidad: 'Metro' },
  { codigo: 'TBAN-06', nombre: 'Tela zamba', categoria: 'Lonas', unidad: 'Metro' },
  { codigo: 'ACR-01', nombre: 'Acrílico Transparente', categoria: 'Acrílicos', unidad: 'Plancha' },
  { codigo: 'ACR-02', nombre: 'Acrílico Color', categoria: 'Acrílicos', unidad: 'Plancha' },
  { codigo: 'PAV-01', nombre: 'Sintra / PVC Espumado', categoria: 'Rígidos', unidad: 'Plancha' },
  { codigo: 'PAI-01', nombre: 'Pai (Poliestireno)', categoria: 'Rígidos', unidad: 'Plancha' },
  { codigo: 'CNC-01', nombre: 'Corte Router CNC', categoria: 'Servicios', unidad: 'Servicio' },
  { codigo: 'LSR-01', nombre: 'Grabado Láser Fibra', categoria: 'Servicios', unidad: 'Servicio' },
  { codigo: 'LSR-02', nombre: 'Corte Láser (Madera/MDF)', categoria: 'Servicios', unidad: 'Servicio' },
  { codigo: 'DTF-01', nombre: 'Impresión DTF UV', categoria: 'Servicios', unidad: 'Metro' },
  { codigo: 'EST-01', nombre: 'Estampado Textil', categoria: 'Servicios', unidad: 'Unidad' },
  { codigo: 'EST-02', nombre: 'Sublimación', categoria: 'Servicios', unidad: 'Unidad' },
  { codigo: 'LET-01', nombre: 'Letras Volumétricas 3D', categoria: 'Estructuras', unidad: 'Unidad' },
  { codigo: 'LET-02', nombre: 'Letrero Exterior', categoria: 'Estructuras', unidad: 'Unidad' },
  { codigo: 'TOT-01', nombre: 'Tótem Publicitario', categoria: 'Estructuras', unidad: 'Unidad' },
  { codigo: 'BOL-01', nombre: 'Bolsa Ecológica / TNT', categoria: 'Merchandising', unidad: 'Unidad' },
  { codigo: 'BOL-02', nombre: 'Bolsa de Papel Kraft', categoria: 'Merchandising', unidad: 'Unidad' },
  { codigo: 'MER-01', nombre: 'Lápiz Corporativo', categoria: 'Merchandising', unidad: 'Unidad' },
  { codigo: 'MER-02', nombre: 'Tazón Personalizado', categoria: 'Merchandising', unidad: 'Unidad' },
  { codigo: 'PAP-01', nombre: 'Tarjetas de Presentación', categoria: 'Papelería', unidad: 'Unidad' },
  { codigo: 'PAP-02', nombre: 'Volantes / Flyers', categoria: 'Papelería', unidad: 'Unidad' },
  { codigo: 'DIS-01', nombre: 'Diseño de Logo', categoria: 'Servicios', unidad: 'Servicio' },
  { codigo: 'DIS-02', nombre: 'Planimetría Técnica', categoria: 'Servicios', unidad: 'Servicio' },
];

const CAT_INGRESOS = ["Impresión y Producción Gráfica", "Corte y Grabado (CNC/Láser)", "Diseño y Branding", "Instalación y Montaje", "Otros Ingresos"];
const CAT_GASTOS = ["Materiales y Sustratos", "Tintas e Insumos", "Herramientas y Repuestos", "Sueldos y Leyes Sociales", "Honorarios", "Servicios Básicos", "Arriendo", "Otros Gastos"];
const BANCOS = ["Santander", "BancoEstado", "Caja Fuerte / Efectivo", "Otro"];
const METODOS_PAGO = ["Transferencia", "Tarjeta de Crédito", "Tarjeta de Débito", "Efectivo", "Cheque al Día", "Cobro Automático"];
const COLORES_TORTA = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
const fmt = (val) => { const n = Number(val); return isNaN(n) ? "0" : n.toLocaleString('es-CL'); };

function MainApp() {
  const [user, setUser] = useState(null); 
  const [loginData, setLoginRequest] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // Ojo en Login
  const [showUserPassword, setShowUserPassword] = useState(false); // Ojo en modulo Usuarios
  
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [darkMode, setDarkMode] = useState(true); 
  const [view, setView] = useState('dashboard'); 

  const [materiales, setMateriales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [movimientos, setMovimientos] = useState([]); 
  const [usuarios, setUsuarios] = useState([]); 
  
  const [sugerenciasLector, setSugerenciasLector] = useState([]); 
  const [archivosProcesados, setArchivosProcesados] = useState([]); 
  const [facturaEnRevision, setFacturaEnRevision] = useState(null);
  const [procesandoFactura, setProcesandoFactura] = useState(false);
  
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toISOString().slice(0, 7)); 
  const [categoriaFiltro, setCategoriaFiltro] = useState(null); 
  const [movsSeleccionados, setMovsSeleccionados] = useState([]); // Para borrado masivo

  const [nuevoMaterial, setNuevoMaterial] = useState({ codigo: '', nombre: '', categoria: '', unidad_medida: 'UN', stock_actual: 0, costo_unitario: 0 });
  const [nuevoCliente, setNuevoCliente] = useState({ razon_social: '', rut: '', alias: '', email: '', telefono: '', direccion: '' });
  const [nuevaOrden, setNuevaOrden] = useState({ cliente_id: '', descripcion: '', fecha_entrega: '', estado: 'Pendiente', link_diseno: '' });
  const [nuevoMov, setNuevoMov] = useState({ tipo: 'Ingreso', categoria: '', monto: '', concepto: '', fecha: new Date().toISOString().split('T')[0], estado_pago: 'Pagado', medio_pago: 'Transferencia' }); 
  const [nuevoUsuario, setNuevoUsuario] = useState({ username: '', password: '', rol: 'Taller' });

  const [editandoMaterialId, setEditandoMaterialId] = useState(null);
  const [editandoClienteId, setEditandoClienteId] = useState(null);
  const [editandoCotizacionId, setEditandoCotizacionId] = useState(null);
  const [editandoMovimientoId, setEditandoMovimientoId] = useState(null);
  const [editandoUsuarioId, setEditandoUsuarioId] = useState(null);

  const [cotizClienteId, setCotizClienteId] = useState('');
  const [cotizVencimiento, setCotizVencimiento] = useState('');
  const [itemsCotizacion, setItemsCotizacion] = useState([]);
  const [itemTemporal, setItemTemporal] = useState({ cantidad: 1, detalle_del_trabajo: '', precio_unitario: 0 });

  const cargarTodo = () => {
    const fetchSeguro = (url, setter) => { fetch(url).then(res => res.ok ? res.json() : []).then(data => { if (Array.isArray(data)) setter(data.filter(item => item !== null && typeof item === 'object')); else setter([]); }).catch(() => setter([])); };
    fetchSeguro(`${API_URL}/materiales/`, setMateriales);
    fetchSeguro(`${API_URL}/clientes/`, setClientes);
    fetchSeguro(`${API_URL}/cotizaciones/`, setCotizaciones);
    fetchSeguro(`${API_URL}/ordenes/`, setOrdenes);
    fetchSeguro(`${API_URL}/movimientos/`, setMovimientos);
    fetchSeguro(`${API_URL}/usuarios/`, setUsuarios);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginData) })
    .then(res => { if (!res.ok) throw new Error(`Error ${res.status}: Credenciales incorrectas.`); return res.json(); })
    .then(data => { setUser(data); cargarTodo(); setView(data.rol === 'Admin' ? 'dashboard' : 'ordenes'); })
    .catch((err) => alert(`🚨 FALLO AL ENTRAR:\n\n${err.message}\n\nOjo con las mayúsculas automáticas del celular.`));
  };

  const themeBg = darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardBg = darkMode ? "bg-slate-800 border-slate-700 shadow-md text-slate-100" : "bg-white border-slate-200 shadow-sm text-slate-800";
  const inputBg = darkMode ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-800";
  const textMuted = darkMode ? "text-slate-400" : "text-slate-500";
  const textHighlight = darkMode ? "text-slate-200" : "text-slate-800";
  const colorRojo = darkMode ? "text-rose-300" : "text-rose-600";
  const colorVerde = darkMode ? "text-emerald-300" : "text-emerald-600";
  const colorAmarillo = darkMode ? "text-amber-300" : "text-amber-600";
  const colorAzul = darkMode ? "text-sky-300" : "text-blue-600";
  const bordeRojo = darkMode ? "border-rose-400/30" : "border-rose-500";
  const bordeAmarillo = darkMode ? "border-amber-300/30" : "border-amber-500";

  // SUPER CATÁLOGO COMBINADO (Base Estática + BD Viva)
  const catalogosUnidos = [
      ...CATALOGO_CREADESIGN.filter(catItem => !materiales.some(m => m.codigo === catItem.codigo)), // Excluye repetidos si ya se escanearon
      ...materiales
  ];

  const obtenerSaldosOT = (ot) => {
    if (!ot || !ot.cotizacion_id) return { total: 0, pagado: 0, saldo: 0, fechas: [] };
    const cot = (cotizaciones || []).find(c => c.id === ot.cotizacion_id);
    if (!cot) return { total: 0, pagado: 0, saldo: 0, fechas: [] };
    const pagadoHastaAhora = (movimientos || []).filter(m => m.tipo === 'Ingreso' && (m.concepto || "").includes(`OT-2026-${1000 + ot.id}`)).reduce((sum, m) => sum + (m.monto || 0), 0);
    const listadoFechas = (movimientos || []).filter(m => m.tipo === 'Ingreso' && (m.concepto || "").includes(`OT-2026-${1000 + ot.id}`)).map(m => `${m.fecha || ''} ($${fmt(m.monto)})`);
    return { total: cot.total || 0, pagado: pagadoHastaAhora, saldo: (cot.total || 0) - pagadoHastaAhora, fechas: listadoFechas };
  };

  const totalIngresos = (movimientos || []).filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + (m.monto || 0), 0);
  const totalGastos = (movimientos || []).filter(m => m.tipo === 'Gasto').reduce((sum, m) => sum + (m.monto || 0), 0);
  const balanceCajaLiquida = totalIngresos - totalGastos;
  const trabajosPendientes = (ordenes || []).filter(o => o.estado === 'Pendiente').length;
  const trabajosProduccion = (ordenes || []).filter(o => o.estado === 'En Producción').length;
  const stockCritico = (materiales || []).filter(m => (m.stock_actual || 0) <= 5 && m.categoria !== 'Servicios');
  const sumDebenTotal = (ordenes || []).reduce((acc, o) => { const s = obtenerSaldosOT(o); return (s && s.pagado === 0) ? acc + (s.total || 0) : acc; }, 0);
  const sumAbonadosSaldo = (ordenes || []).reduce((acc, o) => { const s = obtenerSaldosOT(o); return (s && s.pagado > 0 && s.saldo > 0) ? acc + (s.saldo || 0) : acc; }, 0);
  const sumPagados = (ordenes || []).reduce((acc, o) => { const s = obtenerSaldosOT(o); return (s && s.saldo <= 0 && s.total > 0) ? acc + (s.total || 0) : acc; }, 0);
  const dineroPorCobrar = sumDebenTotal + sumAbonadosSaldo;

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const ultimos7Dias = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return { raw: d.toISOString().split('T')[0], formateada: `${diasSemana[d.getDay()]} ${d.toISOString().split('T')[0].slice(5)}` }; }).reverse();
  const datosGrafico = ultimos7Dias.map(obj => { const movsDia = (movimientos || []).filter(m => m.fecha === obj.raw); const inDia = movsDia.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + (m.monto || 0), 0); const outDia = movsDia.filter(m => m.tipo === 'Gasto').reduce((sum, m) => sum + (m.monto || 0), 0); return { fecha: obj.formateada, inDia, outDia }; });
  const maxGrafico = Math.max(...datosGrafico.map(d => Math.max(d.inDia, d.outDia)), 10000);

  const movsMesSeleccionado = (movimientos || []).filter(m => m.fecha && m.fecha.startsWith(mesSeleccionado));
  const movsAnteriores = (movimientos || []).filter(m => m.fecha && m.fecha < mesSeleccionado + '-01');
  const saldoAnterior = movsAnteriores.reduce((sum, m) => m.tipo === 'Ingreso' ? sum + (m.monto || 0) : sum - (m.monto || 0), 0);
  const ingresosMes = movsMesSeleccionado.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + (m.monto || 0), 0);
  const gastosMes = movsMesSeleccionado.filter(m => m.tipo === 'Gasto').reduce((sum, m) => sum + (m.monto || 0), 0);
  const saldoCajaMes = saldoAnterior + ingresosMes - gastosMes; 
  const fugasBancariasMes = movsMesSeleccionado.filter(m => m.tipo === 'Gasto' && (m.medio_pago === 'Cobro Automático' || (m.concepto && m.concepto.includes('[Cobro Banco]')))).reduce((sum, m) => sum + (m.monto || 0), 0);

  const gastosTotalesMes = movsMesSeleccionado.filter(m => m.tipo === 'Gasto');
  const gastosPorCategoria = {};
  gastosTotalesMes.forEach(m => { gastosPorCategoria[m.categoria] = (gastosPorCategoria[m.categoria] || 0) + (m.monto || 0); });
  const datosTorta = Object.keys(gastosPorCategoria).map(cat => ({ categoria: cat, monto: gastosPorCategoria[cat], porcentaje: gastosMes > 0 ? (gastosPorCategoria[cat] / gastosMes) * 100 : 0 })).sort((a, b) => b.monto - a.monto);
  let anguloAcumulado = 0;
  const gradientStops = datosTorta.map((dato, index) => { const start = anguloAcumulado; anguloAcumulado += dato.porcentaje; return `${COLORES_TORTA[index % COLORES_TORTA.length]} ${start}% ${anguloAcumulado}%`; }).join(', ');
  let movimientosA_Mostrar = movsMesSeleccionado;
  if (categoriaFiltro) movimientosA_Mostrar = movimientosA_Mostrar.filter(m => m.categoria === categoriaFiltro);

  const handleCargarCartola = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (archivosProcesados.includes(file.name)) { e.target.value = ''; return alert(`⚠️ Archivo duplicado: "${file.name}"`); }
    alert("🤖 Escaneando cartola en la nube...");
    const formData = new FormData(); formData.append("file", file);
    try {
        const res = await fetch(`${API_URL}/upload-cartola/`, { method: 'POST', body: formData }); const data = await res.json();
        if (data.sugerencias && data.sugerencias.length > 0) { setSugerenciasLector(data.sugerencias.map(s => ({ ...s, checked: true, banco: s.banco_detectado || 'BancoEstado', metodo: s.locked ? 'Cobro Automático' : 'Transferencia' }))); setArchivosProcesados([...archivosProcesados, file.name]); } 
        else alert(`⚠️ Error del Servidor:\n${data.error || JSON.stringify(data)}`);
    } catch (error) { alert("Error de red."); } e.target.value = '';
  };
  const modificarSugerencia = (idx, c, v) => { const nuevas = [...sugerenciasLector]; nuevas[idx][c] = v; setSugerenciasLector(nuevas); };
  const aprobarSeleccionados = async () => {
      const aAprobar = sugerenciasLector.filter(s => s.checked); if (aAprobar.length === 0) return;
      try {
          await Promise.all(aAprobar.map(sug => fetch(`${API_URL}/movimientos/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: sug.tipo, categoria: sug.categoria, monto: sug.monto, concepto: `[${sug.banco} | ${sug.metodo}] ${sug.concepto}`, fecha: new Date().toISOString().split('T')[0], estado_pago: sug.metodo === 'Tarjeta de Crédito' ? 'Pendiente' : 'Pagado', medio_pago: sug.metodo }) })));
          cargarTodo(); setSugerenciasLector(sugerenciasLector.filter(s => !s.checked)); alert("✅ Movimientos sincronizados.");
      } catch (e) { alert("Error."); }
  };

  const handleCargarFactura = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (archivosProcesados.includes(file.name)) { e.target.value = ''; return alert(`⚠️ La factura "${file.name}" ya fue procesada.`); }
    alert("🤖 Extrayendo información...");
    const formData = new FormData(); formData.append("file", file);
    try {
        const res = await fetch(`${API_URL}/upload-factura/`, { method: 'POST', body: formData }); const data = await res.json();
        if (data.proveedor) { setFacturaEnRevision({ proveedor_rut: data.proveedor.rut, proveedor_nombre: data.proveedor.razon_social, total: data.total, metodo_pago: 'Transferencia', estado_pago: 'Pagado', items: data.items, archivo_nombre: file.name }); } 
        else alert(`⚠️ Error:\n${data.error || JSON.stringify(data)}`);
    } catch (error) { alert("Error de red."); } e.target.value = '';
  };
  const procesarFactura = async () => {
    if (!facturaEnRevision || procesandoFactura) return;
    setProcesandoFactura(true); 
    try {
        await fetch(`${API_URL}/movimientos/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: 'Gasto', categoria: 'Materiales y Sustratos', monto: facturaEnRevision.total, concepto: `Factura: ${facturaEnRevision.proveedor_nombre} (${facturaEnRevision.proveedor_rut})`, fecha: new Date().toISOString().split('T')[0], estado_pago: facturaEnRevision.estado_pago, medio_pago: facturaEnRevision.metodo_pago }) });
        for (let it of facturaEnRevision.items) {
            const mEx = materiales.find(m => m.nombre.toLowerCase() === it.nombre.toLowerCase() || (m.codigo && m.codigo === it.codigo));
            if (mEx) await fetch(`${API_URL}/materiales/${mEx.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...mEx, stock_actual: mEx.stock_actual + parseInt(it.cantidad_ingresar)}) });
            else await fetch(`${API_URL}/materiales/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ codigo: it.codigo || `MAT-${Math.floor(Math.random()*1000)}`, nombre: it.nombre, categoria: it.categoria, stock_actual: parseInt(it.cantidad_ingresar), unidad_medida: it.unidad_medida, costo_unitario: 0 }) });
        }
        cargarTodo(); setArchivosProcesados([...archivosProcesados, facturaEnRevision.archivo_nombre]); setFacturaEnRevision(null); alert("✅ Datos guardados.");
    } catch (error) { alert("Error al guardar."); }
    finally { setProcesandoFactura(false); }
  };

  const enviarAProduccion = async (cot) => {
    if(window.confirm("¿Enviar al Taller y descontar materiales de la bodega?")) {
        let faltantes = []; let actualizacionesStock = [];
        for (let item of (cot.detalles || [])) {
            const codigoltem = item.detalle_del_trabajo.split(':')[0].trim();
            const materialDB = materiales.find(m => m.codigo === codigoltem);
            if (materialDB && materialDB.categoria !== 'Servicios') {
                if (materialDB.stock_actual < item.cantidad) faltantes.push(`- ${materialDB.nombre} (Faltan ${item.cantidad - materialDB.stock_actual} ${materialDB.unidad_medida})`);
                else actualizacionesStock.push({ ...materialDB, stock_actual: materialDB.stock_actual - item.cantidad });
            }
        }
        if (faltantes.length > 0) return alert(`⚠️ Faltan insumos en bodega:\n\n${faltantes.join('\n')}`);
        const abonoSugerido = Math.round((cot.total || 0) / 2);
        const montoIngresado = window.prompt(`Bodega OK ✅\n\n¿El cliente dejó algún abono?\nSugerido: $${fmt(abonoSugerido)}\nSi no, ingresa 0.`, abonoSugerido);
        if (montoIngresado === null) return;
        const abonoInt = parseInt(montoIngresado) || 0;
        try {
            await Promise.all(actualizacionesStock.map(mat => fetch(`${API_URL}/materiales/${mat.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mat) })));
            const resumenTrabajo = (cot.detalles || []).map(d => `${d.cantidad}x ${d.detalle_del_trabajo}`).join('\n');
            const resOT = await fetch(`${API_URL}/ordenes/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cliente_id: cot.cliente?.id, cotizacion_id: cot.id, descripcion: `(Cot. CD-${new Date().getFullYear()}-${1000 + cot.id})\n\n${resumenTrabajo}`, fecha_entrega: new Date().toISOString().split('T')[0], estado: 'Pendiente', link_diseno: '' }) });
            const nuevaOt = await resOT.json();
            if (abonoInt > 0 && nuevaOt?.id) { await fetch(`${API_URL}/movimientos/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: 'Ingreso', categoria: 'Impresión y Producción Gráfica', monto: abonoInt, concepto: `Anticipo OT-2026-${1000 + nuevaOt.id} | ${cot.cliente?.alias || cot.cliente?.razon_social}`, fecha: new Date().toISOString().split('T')[0], estado_pago: 'Abonado', medio_pago: 'Transferencia' }) }); }
            cargarTodo(); alert('🚀 Orden en Taller.'); setView('ordenes');
        } catch (error) { alert("Error al procesar la orden."); }
    }
  };

  const actualizarEstadoOT = (orden, nuevoEstado) => { 
      let descFinal = orden.descripcion; 
      if (nuevoEstado === 'Terminado') { 
          const linkFoto = window.prompt("📸 TRABAJO TERMINADO\nPega link de la foto (Opcional):"); 
          if (linkFoto === null) return; 
          if (linkFoto.trim() !== '') descFinal = descFinal + `\n\n📸 Respaldo: ${linkFoto}`; 
      } 
      fetch(`${API_URL}/ordenes/${orden.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...orden, estado: nuevoEstado, descripcion: descFinal }) }).then(() => cargarTodo()); 
  };
  const editarLinkOT = (ot) => { const nuevoLink = window.prompt("🎨 Link de Diseño:", ot.link_diseno || ''); if (nuevoLink !== null) fetch(`${API_URL}/ordenes/${ot.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...ot, link_diseno: nuevoLink.trim() }) }).then(() => cargarTodo()); };
  const cobrarOrden = (ot) => { const saldos = obtenerSaldosOT(ot); if (saldos && saldos.saldo <= 0) { alert("✅ ¡OT pagada!"); actualizarEstadoOT(ot, 'Terminado'); return; } setNuevoMov({ tipo: 'Ingreso', categoria: 'Impresión y Producción Gráfica', monto: saldos ? saldos.saldo : '', concepto: `Pago OT-2026-${1000 + ot.id} | ${ot.cliente?.alias || ot.cliente?.razon_social}`, fecha: new Date().toISOString().split('T')[0], estado_pago: saldos && saldos.pagado > 0 ? 'Pagado' : 'Abonado', medio_pago: 'Transferencia' }); actualizarEstadoOT(ot, 'Terminado'); setView('finanzas'); };
  const agendarCalendario = (ot) => { const nombreCliente = ot.cliente ? ot.cliente.razon_social : 'Cliente'; const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:OT CREAdesign: ${nombreCliente}\nDTSTART:${ot.fecha_entrega.replace(/-/g, "")}\nDESCRIPTION:${ot.descripcion}\nEND:VEVENT\nEND:VCALENDAR`; const blob = new Blob([icsContent], { type: 'text/calendar' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `OT_${nombreCliente}.ics`; link.click(); };
  const enviarWhatsApp = (ot) => { const nombreCliente = ot.cliente ? ot.cliente.razon_social : 'Cliente'; const linkMsj = ot.link_diseno ? `\n*Diseño:* ${ot.link_diseno}` : ''; const mensaje = `*CREAdesign - OT*\n*Cliente:* ${nombreCliente}\n*Entrega:* ${ot.fecha_entrega}\n\n*Trabajo:*\n${ot.descripcion}${linkMsj}`; window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank'); };

  // --- MÉTODOS CRUD COMBINADOS ---
  const manejarSeleccionCatalogo = (e) => { 
      const item = catalogosUnidos.find(i => i.codigo === e.target.value); 
      if (item) setNuevoMaterial({...nuevoMaterial, codigo: item.codigo, nombre: item.nombre, categoria: item.categoria, unidad_medida: item.unidad_medida || item.unidad || 'UN'}); 
  };

  const guardarMaterial = (e) => { e.preventDefault(); fetch(editandoMaterialId ? `${API_URL}/materiales/${editandoMaterialId}` : `${API_URL}/materiales/`, { method: editandoMaterialId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoMaterial) }).then(() => { cargarTodo(); setNuevoMaterial({ codigo: '', nombre: '', categoria: '', unidad_medida: 'UN', stock_actual: 0, costo_unitario: 0 }); setEditandoMaterialId(null); document.getElementById('selector-catalogo').value = ''; }); };
  const guardarMovimiento = (e) => { e.preventDefault(); const montoIngresado = parseInt(nuevoMov.monto) || 0; if (!editandoMovimientoId) { const matchOT = (nuevoMov.concepto || '').match(/OT-2026-(\d+)/); if (matchOT && nuevoMov.tipo === 'Ingreso') { const otVinculada = (ordenes || []).find(o => o.id === parseInt(matchOT[1]) - 1000); if (otVinculada) { const saldos = obtenerSaldosOT(otVinculada); if (saldos && montoIngresado > saldos.saldo && saldos.saldo > 0) { alert(`⚠️ ALTO: El saldo pendiente es solo de $${fmt(saldos.saldo)}.`); return; } } } } fetch(editandoMovimientoId ? `${API_URL}/movimientos/${editandoMovimientoId}` : `${API_URL}/movimientos/`, { method: editandoMovimientoId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...nuevoMov, monto: montoIngresado }) }).then(() => { cargarTodo(); setNuevoMov({ tipo: 'Ingreso', categoria: '', monto: '', concepto: '', fecha: new Date().toISOString().split('T')[0], estado_pago: 'Pagado', medio_pago: 'Transferencia' }); setEditandoMovimientoId(null); alert("✅ ¡Caja actualizada!"); }); };
  
  // FUNCION ELIMINAR MASIVO EN FINANZAS
  const eliminarMovimientosMasivo = async () => {
    if(movsSeleccionados.length === 0) return;
    if(window.confirm(`¿Seguro que deseas eliminar permanentemente estos ${movsSeleccionados.length} registros financieros?`)) {
        try {
            await Promise.all(movsSeleccionados.map(id => fetch(`${API_URL}/movimientos/${id}`, { method: 'DELETE' })));
            cargarTodo();
            setMovsSeleccionados([]);
            alert("✅ Registros eliminados en masa.");
        } catch(e) { alert("Hubo un error al eliminar."); }
    }
  };
  const toggleSeleccionMov = (id) => { if(movsSeleccionados.includes(id)) setMovsSeleccionados(movsSeleccionados.filter(i => i !== id)); else setMovsSeleccionados([...movsSeleccionados, id]); };
  const toggleSelectAllMovs = () => { if(movsSeleccionados.length === movimientosA_Mostrar.length && movimientosA_Mostrar.length > 0) setMovsSeleccionados([]); else setMovsSeleccionados(movimientosA_Mostrar.map(m => m.id)); };

  const guardarCliente = (e) => { e.preventDefault(); fetch(editandoClienteId ? `${API_URL}/clientes/${editandoClienteId}` : `${API_URL}/clientes/`, { method: editandoClienteId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoCliente) }).then(() => { cargarTodo(); setNuevoCliente({ razon_social: '', rut: '', alias: '', email: '', telefono: '', direccion: '' }); setEditandoClienteId(null); }); };
  const guardarOrden = (e) => { e.preventDefault(); fetch(`${API_URL}/ordenes/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...nuevaOrden, cliente_id: parseInt(nuevaOrden.cliente_id) }) }).then(() => { cargarTodo(); setNuevaOrden({ cliente_id: '', descripcion: '', fecha_entrega: '', estado: 'Pendiente', link_diseno: '' }); }); };
  const guardarUsuario = (e) => { e.preventDefault(); fetch(editandoUsuarioId ? `${API_URL}/usuarios/${editandoUsuarioId}` : `${API_URL}/usuarios/`, { method: editandoUsuarioId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoUsuario) }).then(() => { cargarTodo(); setNuevoUsuario({ username: '', password: '', rol: 'Taller' }); setEditandoUsuarioId(null); alert("✅ Usuario guardado."); }); };
  const eliminarBD = (ruta, id) => { if(window.confirm("¿Eliminar registro?")) fetch(`${API_URL}/${ruta}/${id}`, { method: 'DELETE' }).then(() => cargarTodo()); };

  // --- COTIZACIONES ---
  const subtotalCotiz = (itemsCotizacion || []).reduce((sum, item) => sum + (item.total_item || 0), 0);
  const ivaCotiz = Math.round(subtotalCotiz * 0.19);
  const totalCotiz = subtotalCotiz + ivaCotiz;
  const agregarItemTemporal = (e) => { e.preventDefault(); if (!itemTemporal.detalle_del_trabajo) return; setItemsCotizacion([...itemsCotizacion, {...itemTemporal, total_item: Math.round((itemTemporal.cantidad || 0) * (itemTemporal.precio_unitario || 0)) }]); setItemTemporal({ cantidad: 1, detalle_del_trabajo: '', precio_unitario: 0 }); document.getElementById('selector-cotizacion').value = ''; };
  const editarItem = (idx) => { setItemTemporal(itemsCotizacion[idx]); setItemsCotizacion(itemsCotizacion.filter((_, i) => i !== idx)); };
  const eliminarItem = (idx) => { setItemsCotizacion(itemsCotizacion.filter((_, i) => i !== idx)); };
  const guardarCotizacionFinal = () => { if (!cotizClienteId || !cotizVencimiento || itemsCotizacion.length === 0) return alert("Faltan datos."); const payload = { cliente_id: parseInt(cotizClienteId), fecha_vencimiento: cotizVencimiento, subtotal: subtotalCotiz, iva: ivaCotiz, total: totalCotiz, estado: 'Borrador', detalles: itemsCotizacion }; fetch(editandoCotizacionId ? `${API_URL}/cotizaciones/${editandoCotizacionId}` : `${API_URL}/cotizaciones/`, { method: editandoCotizacionId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(() => { cargarTodo(); setItemsCotizacion([]); setCotizClienteId(''); setEditandoCotizacionId(null); alert("Cotización guardada."); }); };
  const cargarParaEditarCotizacion = (cot) => { setEditandoCotizacionId(cot.id); setCotizClienteId(cot.cliente?.id || ''); setCotizVencimiento(cot.fecha_vencimiento); setItemsCotizacion(cot.detalles || []); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const generarPDF = (cot) => { const f = `CD${new Date().getFullYear()}-${1000+cot.id}`; let filasHtml = ''; (cot.detalles || []).forEach(item => { let codigo = 'SRV'; let detalle = item.detalle_del_trabajo || ''; if(detalle.includes(': ')) { const partes = detalle.split(': '); codigo = partes[0]; detalle = partes.slice(1).join(': '); } filasHtml += `<tr><td style="border: 1px solid #b5d5e5; padding: 8px; text-align: center;">${codigo}</td><td style="border: 1px solid #b5d5e5; padding: 8px; text-align: center;">${item.cantidad}</td><td style="border: 1px solid #b5d5e5; padding: 8px;">${detalle}</td><td style="border: 1px solid #b5d5e5; padding: 8px; text-align: right;">$${fmt(item.precio_unitario)}</td><td style="border: 1px solid #b5d5e5; padding: 8px; text-align: right;">$${fmt(item.total_item)}</td></tr>`; }); const html = `<!DOCTYPE html><html><head><title>Cotizacion_${f}</title><style>* {-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;} body { font-family: Arial, sans-serif; padding: 30px; color: #000; margin: 0; font-size: 13px; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; } .empresa { line-height: 1.3; } .cot-info { text-align: right; margin-top: 20px;} .cot-info h2 { margin: 0 0 10px 0; font-size: 20px; font-weight: normal; } .cliente-box { width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #000;} .cliente-box td { border: 1px solid #000; padding: 8px; font-size: 13px; background-color: #edf3f8; } .tabla-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #000;} .tabla-items th { background-color: #204c86; color: white; border: 1px solid #204c86; padding: 10px 8px; text-align: left; font-size: 13px; font-weight: bold;} .tabla-items th.center { text-align: center; } .tabla-items th.right { text-align: right; } .tabla-items td { background-color: #c9efff; border: 1px solid #90cce8; color: #000;} .totales-container { display: flex; justify-content: flex-end; margin-bottom: 30px; } .tabla-totales { width: 250px; border-collapse: collapse; } .tabla-totales td { border: 1px solid #000; padding: 6px 10px; font-size: 13px; } .bg-gray { background-color: #e6e6e6; } .condiciones { font-size: 13px; line-height: 1.4; margin-top: 10px; } .firma-container { margin-top: 70px; text-align: center; font-size: 14px; font-weight: bold; display: flex; justify-content: space-around; }</style></head><body><div class="header"><div class="empresa"><img src="${window.location.origin}/logo-negro.png" alt="CREAdesign" style="max-width: 250px; margin-bottom: 10px; display: block;" />RIQUELME Y CONTRERAS LTDA.<br>76.433.330-6<br>ANIBAL PINTO 486 OF.504<br>Sucursal Angol 359 of 402- CONCEPCIÓN</div><div class="cot-info"><h2>COTIZACIÓN: <strong>${f}</strong></h2><p>Fecha: ${new Date().toLocaleDateString('es-CL')} &nbsp;&nbsp; Hora: ${new Date().toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}</p></div></div><table class="cliente-box"><tr><td rowspan="2" style="width: 40%; vertical-align: top;">Razón Social<br><br><strong>${cot.cliente?.razon_social || ''}</strong></td><td style="width: 30%;">Rut:<br><br><strong>${cot.cliente?.rut || ''}</strong></td><td style="width: 30%;">Email:<br><br><strong>${cot.cliente?.email || ''}</strong></td></tr><tr><td>Nombre:<br><br><strong>${cot.cliente?.alias || ''}</strong></td><td style="background-color: #fff; color: #059669;">Telefono :<br><br><strong>${cot.cliente?.telefono || ''}</strong></td></tr></table><table class="tabla-items"><thead><tr><th style="width: 12%;" class="center">Cód</th><th style="width: 10%;" class="center">Cant.</th><th style="width: 48%;">Detalle</th><th style="width: 15%;" class="right">Precio U</th><th style="width: 15%;" class="right">Total</th></tr></thead><tbody>${filasHtml}</tbody></table><div class="totales-container"><table class="tabla-totales"><tr><td style="font-weight: bold;">NETO</td><td style="font-weight: bold; text-align: right;">$ ${fmt(cot.subtotal)}</td></tr><tr><td style="font-weight: bold;">IVA</td><td style="font-weight: bold; text-align: right;">$ ${fmt(cot.iva)}</td></tr><tr><td class="bg-gray" style="font-weight: bold;">DSCTO.</td><td class="bg-gray"></td></tr><tr><td style="font-weight: bold;">TOTAL</td><td style="font-weight: bold; text-align: right;">$ ${fmt(cot.total)}</td></tr></table></div><div class="condiciones"><strong>PLAZO ENTREGA A CONVENIR</strong><br>Condiciones Generales:<br>Una vez aprobada la cotización se enviarán foto montajes y diseños para su aprobación<br>&nbsp;&nbsp;&nbsp;&nbsp;Los valores unitarios <strong>NO incluyen IVA</strong>.<br>&nbsp;&nbsp;&nbsp;&nbsp;Los valores están vinculados a las especificaciones estipuladas en cada cotización.<br>&nbsp;&nbsp;&nbsp;&nbsp;Cualquier cambio, implica una modificación del precio ofertado según especificaciones técnicas.<br><strong>Condición de venta: 50 % al aprobar la cotización y saldo contra entrega.</strong><br><strong>La transferencia se debe hacer a nombre de RIQUELME Y CONTRERAS LTDA.</strong><br><u>Numero</u> chequera electrónica o cuenta vista Banco estado<br>5337 1640 319<br>Rut 76.433.330-6<br>Riquelme y contreras ltda<br>Crea.venta@gmail.com</div><div class="firma-container"><div>Francisco Riquelme Estrada.<br><em>CREA DESIGN</em></div><div>Vº Bº</div></div><div style="text-align: center; margin-top: 30px; font-weight: bold; font-style: italic;">CREA DESIGN – 09-8984512 <span>crea.venta@gmail.com</span></div></body><script>setTimeout(() => { window.print(); }, 500);</script></html>`; const v = window.open('','_blank'); v.document.write(html); v.document.close(); };

  // ========================================================
  // 🖥️ INTERFAZ GRÁFICA (REACT)
  // ========================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111c30] border border-[#1e2d4d] rounded-[2rem] p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#007bff] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,123,255,0.5)] mb-4"><span className="text-white text-3xl">💼</span></div>
            <h1 className="text-white text-3xl font-bold tracking-tight">CREAproduce</h1>
            <p className="text-slate-400 text-sm mt-1">Ingresa a tu cuenta</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div><label className="text-slate-300 text-xs uppercase font-bold ml-1">Usuario</label><input type="text" required className="w-full bg-[#1a2641] border border-[#2d3b5a] rounded-xl p-4 text-white focus:outline-none focus:border-[#007bff] transition-all mt-1" placeholder="admin o taller" onChange={e => setLoginRequest({...loginData, username: e.target.value})} /></div>
            <div className="relative">
                <label className="text-slate-300 text-xs uppercase font-bold ml-1">Contraseña</label>
                <input type={showPassword ? "text" : "password"} required className="w-full bg-[#1a2641] border border-[#2d3b5a] rounded-xl p-4 pr-12 text-white focus:outline-none focus:border-[#007bff] transition-all mt-1" placeholder="..." onChange={e => setLoginRequest({...loginData, password: e.target.value})} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-xl opacity-70 hover:opacity-100">{showPassword ? "🙈" : "👁️"}</button>
            </div>
            <button className="w-full bg-[#007bff] text-white font-bold p-4 rounded-xl shadow-[0_5px_15px_rgba(0,123,255,0.3)] hover:scale-[1.01] active:scale-95 transition-all mt-2">Iniciar Sesión</button>
          </form>
          <p className="text-[#3d5a80] text-[10px] text-center mt-6 uppercase tracking-wider font-semibold">Acceso privado CREAdesign | Chile</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${themeBg}`}>
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300`}>
        <div className="p-6 flex justify-between items-center"><div><img src="/logo-blanco.png" alt="CREAdesign" className="h-16 w-auto mb-2 object-contain" /><p className="text-xs text-emerald-400 font-bold tracking-widest uppercase mt-1">⚡ Nube Activa</p></div><button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white font-bold text-xl">✕</button></div>
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {user.rol === 'Admin' && (<button onClick={() => {setView('dashboard'); setSidebarOpen(false);}} className={`w-full flex items-center p-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:bg-slate-800'}`}>📊 Panel Principal</button>)}
          <button onClick={() => {setView('bodega'); setSidebarOpen(false);}} className={`w-full flex items-center p-3 rounded-xl transition-all ${view === 'bodega' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:bg-slate-800'}`}>📦 Bodega y Servicios</button>
          {user.rol === 'Admin' && (<><button onClick={() => {setView('clientes'); setSidebarOpen(false);}} className={`w-full flex items-center p-3 rounded-xl transition-all ${view === 'clientes' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:bg-slate-800'}`}>👥 Clientes</button><button onClick={() => {setView('cotizaciones'); setSidebarOpen(false);}} className={`w-full flex items-center p-3 rounded-xl transition-all ${view === 'cotizaciones' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:bg-slate-800'}`}>📄 Cotizaciones</button></>)}
          <button onClick={() => {setView('ordenes'); setSidebarOpen(false);}} className={`w-full flex items-center p-3 rounded-xl transition-all ${view === 'ordenes' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:bg-slate-800'}`}>🛠️ Órdenes de Trabajo</button>
          {user.rol === 'Admin' && (<button onClick={() => {setView('finanzas'); setSidebarOpen(false);}} className={`w-full flex items-center p-3 rounded-xl transition-all ${view === 'finanzas' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:bg-slate-800'}`}>💰 Finanzas</button>)}
          {user.rol === 'Admin' && (<button onClick={() => {setView('usuarios'); setSidebarOpen(false);}} className={`w-full flex items-center p-3 rounded-xl transition-all ${view === 'usuarios' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:bg-slate-800'}`}>🔐 Usuarios y Accesos</button>)}
          {user.rol === 'Admin' && (<a href="https://www1.sii.cl/cgi-bin/Portal001/mipeLaunchPage.cgi?OPCION=33&TIPO=4" target="_blank" rel="noreferrer" className="w-full flex items-center p-3 rounded-xl transition-all text-emerald-400 hover:bg-emerald-900/20 font-bold border border-transparent hover:border-emerald-900/50 mt-4">📄 Facturar (SII) ↗</a>)}
          <div className="pt-10"><button onClick={() => setUser(null)} className="w-full text-left p-3 rounded-xl text-rose-400 hover:bg-rose-900/20 font-bold transition border border-rose-900/20">🚪 Cerrar Sesión</button></div>
        </nav>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden"></div>}

      <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-6 lg:mb-10">
          <div className="flex items-center gap-4"><button onClick={() => setSidebarOpen(true)} className={`lg:hidden p-2 rounded-lg border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>☰</button><h2 className={`text-xl lg:text-3xl font-bold capitalize ${textHighlight}`}>{view === 'bodega' ? 'Bodega' : view === 'ordenes' ? 'Taller de Producción' : view === 'dashboard' ? 'Torre de Control' : view}</h2></div>
          <div className="flex gap-2 lg:gap-4 items-center">
            <button onClick={() => setDarkMode(!darkMode)} className={`px-3 py-2 lg:px-4 lg:py-2.5 rounded-full shadow-sm border font-bold text-xs lg:text-sm transition-colors ${darkMode ? 'bg-slate-800 text-yellow-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-800 hover:bg-slate-100'}`}>{darkMode ? '☀️ Claro' : '🌙 Oscuro'}</button>
            <div className={`flex gap-2 items-center px-3 py-2 lg:px-5 lg:py-2.5 rounded-full shadow-sm border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}><span className={`text-xs lg:text-sm font-medium ${textMuted} hidden lg:inline`}>Perfil:</span><span className={`text-xs lg:text-sm font-black ${textHighlight}`}>{user.username.toUpperCase()}</span></div>
          </div>
        </header>

        {/* --- 1. DASHBOARD ORIGINAL --- */}
        {view === 'dashboard' && user.rol === 'Admin' && (
          <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className={`p-4 lg:p-6 rounded-3xl border flex flex-col justify-center transition-colors ${darkMode ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-200'}`}><p className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider ${colorVerde}`}>Caja Líquida Actual</p><h3 className={`text-2xl lg:text-3xl font-black mt-2 ${colorVerde}`}>${fmt(balanceCajaLiquida)}</h3></div>
              <div className={`p-4 lg:p-6 rounded-3xl border flex flex-col justify-center transition-colors ${cardBg}`}><p className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider ${textMuted}`}>Por Cobrar (Deuda)</p><h3 className={`text-2xl lg:text-3xl font-black mt-2 ${colorAmarillo}`}>${fmt(dineroPorCobrar)}</h3></div>
              <div className={`p-4 lg:p-6 rounded-3xl border flex flex-col justify-center border-l-4 transition-colors ${cardBg} ${bordeRojo}`}><p className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider ${textMuted}`}>OTs Pendientes</p><h3 className={`text-2xl lg:text-3xl font-black mt-2 ${colorRojo}`}>{fmt(trabajosPendientes)}</h3></div>
              <div className={`p-4 lg:p-6 rounded-3xl border flex flex-col justify-center border-l-4 transition-colors ${cardBg} ${bordeAmarillo}`}><p className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider ${textMuted}`}>OTs En Producción</p><h3 className={`text-2xl lg:text-3xl font-black mt-2 ${colorAmarillo}`}>{fmt(trabajosProduccion)}</h3></div>
            </div>

            <div className={`rounded-3xl border p-4 lg:p-6 transition-colors ${cardBg}`}>
              <h3 className={`text-lg lg:text-xl font-black border-b pb-3 mb-6 flex items-center gap-2 ${darkMode ? 'border-slate-700 text-slate-200' : 'text-slate-800'}`}>📊 Flujo de Caja (Últimos 7 Días)</h3>
              <div className="flex items-end justify-between gap-1 md:gap-2 h-48 mt-4 pt-4">
                {datosGrafico.map((dia, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-end w-full group relative">
                    <div className="flex gap-0.5 md:gap-2 items-end h-32 w-full justify-center">
                      <div className="flex flex-col items-center justify-end h-full">
                        {dia.inDia > 0 && <span className={`text-[8px] lg:text-[10px] font-bold mb-1 hidden md:block ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>${fmt(dia.inDia)}</span>}
                        <div className={`w-3 md:w-6 rounded-t-sm transition-all ${darkMode ? 'bg-emerald-500/80 hover:bg-emerald-400' : 'bg-emerald-500 hover:bg-emerald-400'}`} style={{ height: `${(dia.inDia / maxGrafico) * 100}%`, minHeight: dia.inDia > 0 ? '4px' : '0' }} title={`Ingresos: $${fmt(dia.inDia)}`}></div>
                      </div>
                      <div className="flex flex-col items-center justify-end h-full">
                        {dia.outDia > 0 && <span className={`text-[8px] lg:text-[10px] font-bold mb-1 hidden md:block ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>${fmt(dia.outDia)}</span>}
                        <div className={`w-3 md:w-6 rounded-t-sm transition-all ${darkMode ? 'bg-rose-500/80 hover:bg-rose-400' : 'bg-rose-500 hover:bg-rose-400'}`} style={{ height: `${(dia.outDia / maxGrafico) * 100}%`, minHeight: dia.outDia > 0 ? '4px' : '0' }} title={`Gastos: $${fmt(dia.outDia)}`}></div>
                      </div>
                    </div>
                    <span className={`text-[8px] md:text-xs font-bold mt-2 text-center whitespace-nowrap ${textMuted}`}>{dia.fecha}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-6 border-t pt-4 border-slate-700/50">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500/80"></div><span className={`text-xs font-bold ${textMuted}`}>Ingresos</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500/80"></div><span className={`text-xs font-bold ${textMuted}`}>Gastos</span></div>
              </div>
            </div>

            <div className={`rounded-3xl border p-4 lg:p-6 space-y-4 lg:space-y-6 transition-colors ${cardBg}`}>
              <h3 className={`text-lg lg:text-xl font-black border-b pb-3 flex items-center gap-2 ${darkMode ? 'border-slate-700 text-slate-200' : 'text-slate-800'}`}>💰 Cuentas y Fechas de Pago</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className={`p-4 rounded-2xl border space-y-3 ${darkMode ? 'bg-rose-900/10 border-rose-900/30' : 'bg-rose-50/50 border-rose-100'}`}>
                  <div className={`border-b pb-2 ${darkMode ? 'border-rose-900/50' : 'border-rose-200'}`}><h4 className={`text-xs lg:text-sm font-black uppercase tracking-wider ${colorRojo}`}>Deben Total</h4><p className={`text-[10px] lg:text-xs font-bold mt-1 ${darkMode ? 'text-rose-300' : 'text-rose-400'}`}>Suma: ${fmt(sumDebenTotal)}</p></div>
                  {(ordenes || []).filter(o => obtenerSaldosOT(o)?.pagado === 0).length === 0 ? (<p className={`text-[10px] lg:text-xs text-center py-4 ${textMuted}`}>No hay deudas totales.</p>) : ((ordenes || []).filter(o => obtenerSaldosOT(o)?.pagado === 0).map(ot => { const s = obtenerSaldosOT(ot); return (<div key={ot.id} className={`p-3 rounded-xl border shadow-sm text-xs ${darkMode ? 'bg-slate-800/80 border-rose-900/30 text-slate-200' : 'bg-white border-rose-200 text-slate-800'}`}><p className="font-black uppercase">{ot.cliente?.alias || ot.cliente?.razon_social}</p><p className={`font-medium mt-1 ${textMuted}`}>OT-2026-{1000 + (ot.id || 0)}</p><p className={`text-right font-black text-xs lg:text-sm mt-2 ${colorRojo}`}>Debe: ${fmt(s?.total)}</p></div>); }))}
                </div>
                <div className={`p-4 rounded-2xl border space-y-3 ${darkMode ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50/40 border-amber-100'}`}>
                  <div className={`border-b pb-2 ${darkMode ? 'border-amber-900/50' : 'border-amber-200'}`}><h4 className={`text-xs lg:text-sm font-black uppercase tracking-wider ${colorAmarillo}`}>Abonados</h4><p className={`text-[10px] lg:text-xs font-bold mt-1 ${darkMode ? 'text-amber-300' : 'text-amber-500'}`}>Suma Deuda: ${fmt(sumAbonadosSaldo)}</p></div>
                  {(ordenes || []).filter(o => { const s = obtenerSaldosOT(o); return s && s.pagado > 0 && s.saldo > 0; }).length === 0 ? (<p className={`text-[10px] lg:text-xs text-center py-4 ${textMuted}`}>No hay abonos pendientes.</p>) : ((ordenes || []).filter(o => { const s = obtenerSaldosOT(o); return s && s.pagado > 0 && s.saldo > 0; }).map(ot => { const s = obtenerSaldosOT(ot); return (<div key={ot.id} className={`p-3 rounded-xl border shadow-sm text-xs space-y-1.5 ${darkMode ? 'bg-slate-800/80 border-amber-900/30 text-slate-200' : 'bg-white border-amber-200 text-slate-800'}`}><p className="font-black uppercase">{ot.cliente?.alias || ot.cliente?.razon_social}</p><p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>OT-2026-{1000 + (ot.id || 0)}</p><div className={`p-1.5 rounded text-[10px] ${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-500'}`}><p className="font-bold border-b border-black/10 pb-0.5 mb-1">Abonos:</p>{(s?.fechas || []).map((f, idx) => <p key={idx}>{f}</p>)}</div><div className="flex justify-between items-center pt-1"><span className={`font-bold ${colorVerde}`}>Pagó: ${fmt(s?.pagado)}</span><span className={`font-black text-xs lg:text-sm ${colorRojo}`}>Resta: ${fmt(s?.saldo)}</span></div></div>); }))}
                </div>
                <div className={`p-4 rounded-2xl border space-y-3 ${darkMode ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50/40 border-emerald-100'}`}>
                  <div className={`border-b pb-2 ${darkMode ? 'border-emerald-900/50' : 'border-emerald-200'}`}><h4 className={`text-xs lg:text-sm font-black uppercase tracking-wider ${colorVerde}`}>Pagados 100%</h4><p className={`text-[10px] lg:text-xs font-bold mt-1 ${darkMode ? 'text-emerald-300' : 'text-emerald-500'}`}>Recaudado: ${fmt(sumPagados)}</p></div>
                  {(ordenes || []).filter(o => { const s = obtenerSaldosOT(o); return s && s.saldo <= 0 && s.total > 0; }).length === 0 ? (<p className={`text-[10px] lg:text-xs text-center py-4 ${textMuted}`}>No hay trabajos saldados aún.</p>) : ((ordenes || []).filter(o => { const s = obtenerSaldosOT(o); return s && s.saldo <= 0 && s.total > 0; }).map(ot => { const s = obtenerSaldosOT(ot); return (<div key={ot.id} className={`p-3 rounded-xl border shadow-sm text-xs space-y-1 ${darkMode ? 'bg-slate-800/80 border-emerald-900/30 text-slate-200' : 'bg-white border-emerald-200 text-slate-800'}`}><p className="font-black uppercase">{ot.cliente?.alias || ot.cliente?.razon_social}</p><div className={`p-1 rounded text-[10px] mt-2 ${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>{(s?.fechas || []).map((f, idx) => <p key={idx}>{f}</p>)}</div><p className={`text-right font-black text-xs lg:text-sm pt-2 ${colorVerde}`}>Saldado: ${fmt(s?.total)}</p></div>); }))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
              <div className={`rounded-3xl border p-4 lg:p-6 transition-colors ${cardBg}`}>
                <h3 className="text-sm lg:text-lg font-bold mb-4 flex items-center gap-2">⚠️ Alertas Críticas de Bodega</h3>
                {(stockCritico || []).length === 0 ? (<div className={`p-4 rounded-xl text-xs lg:text-sm font-bold text-center ${darkMode ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>¡Suficiente stock!</div>) : (<div className="space-y-3">{(stockCritico || []).map(m => (<div key={m.id} className={`flex justify-between items-center p-3 lg:p-4 rounded-xl border ${darkMode ? 'bg-rose-900/10 border-rose-900/30' : 'bg-rose-50/20 border-rose-200'}`}><div><p className={`font-bold text-xs lg:text-base ${colorRojo}`}>{m.nombre}</p><p className={`text-[10px] lg:text-xs uppercase ${darkMode ? 'text-rose-300' : 'text-rose-400'}`}>{m.categoria}</p></div><div className="text-right"><p className={`text-xl lg:text-2xl font-black ${colorRojo}`}>{m.stock_actual}</p><p className={`text-[10px] uppercase font-bold ${darkMode ? 'text-rose-300' : 'text-rose-400'}`}>Quedan</p></div></div>))}</div>)}
              </div>
              <div className={`rounded-3xl border p-4 lg:p-6 transition-colors ${cardBg}`}>
                <h3 className="text-sm lg:text-lg font-bold mb-4 flex items-center gap-2">📦 Próximas Entregas (Taller)</h3>
                {(ordenes || []).filter(o => o.estado !== 'Terminado').length === 0 ? (<div className={`p-4 rounded-xl text-xs lg:text-sm font-bold text-center ${darkMode ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>No hay trabajos activos.</div>) : (<div className="space-y-3">{[...(ordenes || [])].reverse().filter(o => o.estado !== 'Terminado').slice(0, 5).map(ot => (<div key={ot.id} className={`flex justify-between items-center p-3 lg:p-4 rounded-xl border transition ${darkMode ? 'bg-slate-700/30 hover:bg-slate-700/60 border-slate-600' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}><div><p className="font-bold text-xs lg:text-base">{ot.cliente?.alias || ot.cliente?.razon_social}</p><span className={`text-[8px] lg:text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${ot.estado === 'Pendiente' ? (darkMode ? 'bg-rose-900/30 text-rose-300' : 'bg-rose-100 text-rose-700') : (darkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700')}`}>{ot.estado}</span></div><div className="text-right"><p className="text-xs lg:text-sm font-bold">{ot.fecha_entrega}</p></div></div>))}</div>)}
              </div>
            </div>
          </div>
        )}

        {/* --- 2. BODEGA Y STOCK --- */}
        {view === 'bodega' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4">
              
              {/* ESCÁNER INTELIGENTE DE FACTURAS */}
              <div className={`p-6 rounded-3xl border shadow-sm ${darkMode ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-indigo-50 border-indigo-200'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="min-w-0"><h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>📥 Ingreso Inteligente de Facturas</h3></div>
                      <label className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-3 rounded-xl cursor-pointer shadow-md w-full md:w-auto text-center">📄 Subir Factura (PDF / XML)<input type="file" accept=".pdf, .xml" className="hidden" onChange={handleCargarFactura} /></label>
                  </div>
                  {facturaEnRevision && (
                      <div className="mt-6 border-t border-indigo-500/20 pt-6">
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                  <h4 className="font-bold text-sm text-indigo-500">1. Datos Proveedor</h4>
                                  <div><label className="text-[10px] uppercase font-bold text-slate-500">RUT Proveedor</label><input type="text" className={`w-full p-2.5 rounded-lg border focus:outline-none ${inputBg}`} value={facturaEnRevision.proveedor_rut} onChange={e=>setFacturaEnRevision({...facturaEnRevision, proveedor_rut: e.target.value})} /></div>
                                  <div><label className="text-[10px] uppercase font-bold text-slate-500">Nombre / Razón Social</label><input type="text" className={`w-full p-2.5 rounded-lg border focus:outline-none font-bold ${inputBg}`} value={facturaEnRevision.proveedor_nombre} onChange={e=>setFacturaEnRevision({...facturaEnRevision, proveedor_nombre: e.target.value})} /></div>
                                  <div><label className="text-[10px] uppercase font-bold text-slate-500">Total Factura</label><div className="relative"><span className="absolute left-3 top-2.5 font-black text-rose-500">$</span><input type="number" className={`w-full p-2.5 pl-7 rounded-lg border font-black text-rose-500 focus:outline-none ${inputBg}`} value={facturaEnRevision.total} onChange={e=>setFacturaEnRevision({...facturaEnRevision, total: parseInt(e.target.value) || 0})} /></div></div>
                                  <div className="flex flex-col sm:flex-row gap-2"><div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-500">Estado de Pago</label><select className={`w-full p-2.5 rounded-lg border font-bold focus:outline-none ${facturaEnRevision.estado_pago === 'Pendiente' ? 'text-amber-500 border-amber-500' : 'text-emerald-500 border-emerald-500'} ${inputBg}`} value={facturaEnRevision.estado_pago} onChange={e=>setFacturaEnRevision({...facturaEnRevision, estado_pago: e.target.value})}><option value="Pagado">Al Contado (Pagada)</option><option value="Pendiente">A Crédito (Por Pagar)</option></select></div><div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-500">Método de Pago</label><select className={`w-full p-2.5 rounded-lg border focus:outline-none ${inputBg}`} value={facturaEnRevision.metodo_pago} onChange={e=>setFacturaEnRevision({...facturaEnRevision, metodo_pago: e.target.value})}>{METODOS_PAGO.map(m=><option key={m} value={m}>{m}</option>)}</select></div></div>
                              </div>
                              <div>
                                  <h4 className="font-bold text-sm mb-4 text-indigo-500">2. Materiales a crear / sumar</h4>
                                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                      {facturaEnRevision.items.map((it, idx) => (
                                          <div key={idx} className={`p-3 border rounded-xl flex flex-wrap sm:flex-nowrap gap-2 items-center ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                              <div className="w-16"><label className="text-[8px] uppercase block text-slate-500 font-bold">Código</label><input type="text" className={`w-full p-1 border-b font-mono text-xs font-bold focus:outline-none ${darkMode ? 'bg-transparent border-slate-600 text-sky-400' : 'bg-transparent border-slate-300 text-blue-600'}`} value={it.codigo} onChange={e => { const n = [...facturaEnRevision.items]; n[idx].codigo = e.target.value; setFacturaEnRevision({...facturaEnRevision, items: n}) }} /></div>
                                              <div className="flex-1 min-w-[120px]"><label className="text-[8px] uppercase block text-slate-500 font-bold">Descripción</label><input type="text" className={`w-full p-1 border-b text-xs font-bold focus:outline-none ${darkMode ? 'bg-transparent border-slate-600' : 'bg-transparent border-slate-300'}`} value={it.nombre} onChange={e => { const n = [...facturaEnRevision.items]; n[idx].nombre = e.target.value; setFacturaEnRevision({...facturaEnRevision, items: n}) }} /></div>
                                              <div className="w-12"><label className="text-[8px] uppercase block text-slate-500 font-bold text-center">U.M.</label><input type="text" className={`w-full text-center p-1 border-b text-xs font-bold uppercase focus:outline-none ${darkMode ? 'bg-transparent border-slate-600' : 'bg-transparent border-slate-300'}`} value={it.unidad_medida || 'UN'} onChange={e => { const n = [...facturaEnRevision.items]; n[idx].unidad_medida = e.target.value.toUpperCase(); setFacturaEnRevision({...facturaEnRevision, items: n}) }} /></div>
                                              <div className="w-14"><label className="text-[8px] uppercase block text-center text-slate-500 font-bold">Sumar</label><input type="number" className="w-full text-center font-black p-1 border rounded bg-transparent" value={it.cantidad_ingresar} onChange={e => { const n = [...facturaEnRevision.items]; n[idx].cantidad_ingresar = parseInt(e.target.value)||1; setFacturaEnRevision({...facturaEnRevision, items: n}) }} /></div>
                                              <button onClick={() => setFacturaEnRevision({...facturaEnRevision, items: facturaEnRevision.items.filter((_, i) => i !== idx)})} className="text-rose-500 mt-3 sm:mt-0 p-1">✕</button>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4 border-t border-indigo-500/20 pt-4">
                              <button onClick={()=>setFacturaEnRevision(null)} className="px-4 py-3 text-rose-500 font-bold hover:bg-rose-500/10 rounded-xl" disabled={procesandoFactura}>Cancelar</button>
                              <button onClick={procesarFactura} disabled={procesandoFactura} className={`px-6 py-3 rounded-xl font-bold shadow-lg text-white transition-all ${procesandoFactura ? 'bg-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'}`}>{procesandoFactura ? '⏳ Guardando Todo...' : '✅ Aprobar e Ingresar'}</button>
                          </div>
                      </div>
                  )}
              </div>

              {(materiales || []).length === 0 ? (<div className={`text-center py-10 rounded-2xl border ${cardBg}`}>No hay insumos.</div>) : ((materiales || []).sort((a,b)=>b.id-a.id).map(m => (<div key={m.id} className={`p-4 lg:p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${m.stock_actual <= 5 && m.categoria !== 'Servicios' ? (darkMode ? 'border-rose-900/50 bg-rose-900/10' : 'border-rose-300 bg-rose-50') : cardBg}`}><div><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${darkMode ? 'bg-blue-900/30 text-sky-300' : 'bg-blue-50 text-blue-600'}`}>{m.categoria}</span><h3 className="text-base lg:text-lg font-semibold mt-2">{m.nombre}</h3><p className={`text-xs lg:text-sm ${textMuted}`}>{m.codigo}</p></div><div className="text-left md:text-right w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-700"><span className={`text-2xl lg:text-3xl font-bold ${m.stock_actual <= 5 && m.categoria !== 'Servicios' ? colorRojo : ''}`}>{fmt(m.stock_actual)}</span><span className={`text-xs lg:text-sm ml-1 ${textMuted}`}>{m.unidad_medida}</span>{user.rol === 'Admin' && (<div className={`text-[10px] lg:text-xs font-bold mt-1 ${colorVerde}`}>Total Inv.: ${fmt((m.stock_actual || 0) * (m.costo_unitario || 0))}</div>)}</div>{user.rol === 'Admin' && (<div className="mt-3 flex justify-start md:justify-end space-x-2"><button onClick={() => {setEditandoMaterialId(m.id); setNuevoMaterial(m); window.scrollTo({ top: 0, behavior: 'smooth' });}} className={`p-1.5 rounded-md text-xs font-bold transition-colors ${darkMode ? 'bg-slate-700 text-sky-300' : 'bg-slate-100 text-blue-600'}`}>Editar</button><button onClick={() => eliminarBD('materiales', m.id)} className={`p-1.5 rounded-md text-xs font-bold transition-colors ${darkMode ? 'bg-slate-700 text-rose-300' : 'bg-slate-100 text-red-600'}`}>Eliminar</button></div>)}</div>)))}
            </div>

            {user.rol === 'Admin' && (
              <div className={`p-5 lg:p-6 rounded-3xl border shadow-sm h-fit sticky top-10 transition-colors ${cardBg}`}>
                <h3 className={`text-base lg:text-lg font-bold mb-4 pb-4 border-b ${darkMode ? 'border-slate-700' : ''}`}>{editandoMaterialId ? '✏️ Editando Insumo' : '📦 Ingresar Manual'}</h3>
                {!editandoMaterialId && (
                  <div className={`mb-4 p-3 lg:p-4 rounded-xl border ${darkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50/50 border-blue-100'}`}>
                    <label className={`text-[10px] lg:text-xs font-bold uppercase ${colorAzul}`}>⚡ Autocompletar</label>
                    <select id="selector-catalogo" className={`w-full mt-2 p-2 rounded text-xs lg:text-sm ${inputBg}`} onChange={manejarSeleccionCatalogo}>
                        <option value="">-- Catálogo y B.D --</option>
                        {catalogosUnidos.map(item => (<option key={item.codigo} value={item.codigo}>{item.codigo}: {item.nombre}</option>))}
                    </select>
                  </div>
                )}
                <form onSubmit={guardarMaterial} className="space-y-4">
                  <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>CÓDIGO</label><input type="text" required className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg text-xs lg:text-sm font-mono ${inputBg}`} value={nuevoMaterial.codigo} onChange={e => setNuevoMaterial({...nuevoMaterial, codigo: e.target.value})} /></div>
                  <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>NOMBRE</label><input type="text" required className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg text-xs lg:text-sm font-bold ${inputBg}`} value={nuevoMaterial.nombre} onChange={e => setNuevoMaterial({...nuevoMaterial, nombre: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-2 lg:gap-4">
                    <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>CATEGORÍA</label><select required className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg text-xs lg:text-sm ${inputBg}`} value={nuevoMaterial.categoria} onChange={e => setNuevoMaterial({...nuevoMaterial, categoria: e.target.value})}><option value="">Selecciona...</option><option value="Acrílicos">Acrílicos</option><option value="Adhesivos">Adhesivos</option><option value="Estructuras">Estructuras</option><option value="Lonas">Lonas</option><option value="Maderas">Maderas</option><option value="Merchandising">Merchandising</option><option value="Metales">Metales</option><option value="Papelería">Papelería</option><option value="Rígidos">Rígidos</option><option value="Servicios">Servicios</option><option value="Insumos Varios">Insumos Varios</option></select></div>
                    <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>UNIDAD</label><input type="text" required className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg text-xs lg:text-sm uppercase text-center font-bold ${inputBg}`} value={nuevoMaterial.unidad_medida} onChange={e => setNuevoMaterial({...nuevoMaterial, unidad_medida: e.target.value.toUpperCase()})} placeholder="UN" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 lg:gap-4">
                    <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>STOCK</label><input type="number" required step="0.1" className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg text-xs lg:text-sm font-black ${inputBg}`} value={nuevoMaterial.stock_actual} onChange={e => setNuevoMaterial({...nuevoMaterial, stock_actual: e.target.value})} /></div>
                    <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>COSTO UN.</label><input type="number" required className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg text-xs lg:text-sm ${inputBg}`} value={nuevoMaterial.costo_unitario} onChange={e => setNuevoMaterial({...nuevoMaterial, costo_unitario: e.target.value})} /></div>
                  </div>
                  <button type="submit" className={`w-full text-white font-bold p-3 rounded-lg ${editandoMaterialId ? 'bg-amber-500' : 'bg-blue-600'}`}>{editandoMaterialId ? 'Actualizar' : '+ Guardar'}</button>
                  {editandoMaterialId && (<button type="button" onClick={() => { setEditandoMaterialId(null); setNuevoMaterial({codigo: '', nombre: '', categoria: '', unidad_medida: 'UN', stock_actual: 0, costo_unitario: 0}) }} className={`w-full underline text-[10px] lg:text-sm pt-2 ${textMuted}`}>Cancelar</button>)}
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- 3. CLIENTES --- */}
        {view === 'clientes' && user.rol === 'Admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4">
              {(clientes || []).length === 0 ? (<div className={`text-center py-10 rounded-2xl border ${cardBg}`}>No hay clientes.</div>) : ((clientes || []).sort((a,b)=>b.id-a.id).map(c => (<div key={c.id} className={`p-4 lg:p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start transition-colors ${cardBg} ${darkMode ? 'hover:border-blue-500/50' : 'hover:border-blue-300'}`}><div className="mb-4 md:mb-0 w-full"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-400'}`}>RUT: {c.rut}</span>{c.alias ? (<><h3 className={`text-xl lg:text-2xl font-black mt-2 uppercase ${colorAzul}`}>{c.alias}</h3><h4 className={`text-[10px] lg:text-xs font-bold uppercase mt-1 tracking-wider ${textMuted}`}>{c.razon_social}</h4></>) : (<h3 className="text-lg lg:text-xl font-bold mt-2">{c.razon_social}</h3>)}{c.direccion && <p className={`text-xs lg:text-sm mt-2 ${textMuted}`}>{c.direccion}</p>}</div><div className={`text-left md:text-right text-xs space-y-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 ${darkMode ? 'border-slate-700' : 'border-slate-200'} ${textMuted}`}>{c.email && <p>{c.email}</p>}{c.telefono && <p>{c.telefono}</p>}<div className="flex justify-start md:justify-end space-x-2 pt-2"><button onClick={() => {setEditandoClienteId(c.id); setNuevoCliente(c); window.scrollTo({ top: 0, behavior: 'smooth' });}} className={`p-1.5 rounded-md font-bold transition-colors ${darkMode ? 'bg-slate-700 text-sky-300' : 'bg-slate-100 text-blue-600'}`}>Editar</button><button onClick={() => eliminarBD('clientes', c.id)} className={`p-1.5 rounded-md font-bold transition-colors ${darkMode ? 'bg-slate-700 text-rose-300' : 'bg-slate-100 text-red-600'}`}>Eliminar</button></div></div></div>)))}
            </div>
            <div className={`p-5 lg:p-6 rounded-3xl border shadow-sm h-fit sticky top-10 transition-colors ${cardBg}`}>
              <h3 className={`text-base lg:text-lg font-bold mb-4 pb-4 border-b ${darkMode ? 'border-slate-700' : ''}`}>{editandoClienteId ? '✏️ Editando Cliente' : '👥 Añadir Cliente'}</h3>
              <form onSubmit={guardarCliente} className="space-y-4 text-xs lg:text-sm">
                <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>ALIAS</label><input type="text" placeholder="Ej: 5 Magnolias" className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg font-bold ${inputBg}`} value={nuevoCliente.alias} onChange={e => setNuevoCliente({...nuevoCliente, alias: e.target.value})} /></div>
                <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>RAZÓN SOCIAL (LEGAL)</label><input type="text" required className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg ${inputBg}`} value={nuevoCliente.razon_social} onChange={e => setNuevoCliente({...nuevoCliente, razon_social: e.target.value})} /></div>
                <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>RUT</label><input type="text" required className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg ${inputBg}`} value={nuevoCliente.rut} onChange={e => setNuevoCliente({...nuevoCliente, rut: e.target.value})} /></div>
                <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>CORREO</label><input type="email" className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg ${inputBg}`} value={nuevoCliente.email} onChange={e => setNuevoCliente({...nuevoCliente, email: e.target.value})} /></div>
                <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>TELÉFONO</label><input type="text" className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg ${inputBg}`} value={nuevoCliente.telefono} onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} /></div>
                <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>DIRECCIÓN</label><input type="text" className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg ${inputBg}`} value={nuevoCliente.direccion} onChange={e => setNuevoCliente({...nuevoCliente, direccion: e.target.value})} /></div>
                <button type="submit" className={`w-full text-white font-bold p-3 rounded-lg ${editandoClienteId ? 'bg-amber-500' : 'bg-blue-600'}`}>{editandoClienteId ? 'Actualizar' : '+ Registrar'}</button>
                {editandoClienteId && (<button type="button" onClick={() => { setEditandoClienteId(null); setNuevoCliente({razon_social:'',rut:'', alias:'', email:'', telefono:'', direccion:''}) }} className={`w-full underline pt-2 ${textMuted}`}>Cancelar</button>)}
              </form>
            </div>
          </div>
        )}

        {/* --- 4. COTIZACIONES --- */}
        {view === 'cotizaciones' && user.rol === 'Admin' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            <div className={`xl:col-span-2 p-4 lg:p-8 rounded-3xl border shadow-sm space-y-6 transition-colors ${cardBg}`}>
              <h3 className={`text-lg lg:text-xl font-bold border-b pb-4 ${darkMode ? 'border-slate-700' : ''}`}>{editandoCotizacionId ? '✏️ Editando Cotización' : '📄 Generar Nueva Cotización'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div><label className={`text-[10px] lg:text-xs font-bold uppercase ${textMuted}`}>CLIENTE</label><select required className={`w-full mt-2 p-2 lg:p-2.5 rounded-xl ${inputBg}`} value={cotizClienteId} onChange={e => setCotizClienteId(e.target.value)}><option value="">-- Seleccionar --</option>{(clientes || []).map(c => <option key={c.id} value={c.id}>{c.alias ? `${c.alias} (${c.razon_social})` : c.razon_social}</option>)}</select></div>
                <div><label className={`text-[10px] lg:text-xs font-bold uppercase ${textMuted}`}>VENCIMIENTO</label><input type="date" required className={`w-full mt-2 p-2 lg:p-2.5 rounded-xl ${inputBg}`} value={cotizVencimiento} onChange={e => setCotizVencimiento(e.target.value)} /></div>
              </div>
              <div className={`p-4 lg:p-5 rounded-2xl border space-y-4 ${darkMode ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`mb-2 p-2 lg:p-3 rounded-lg text-xs font-medium border flex flex-col md:flex-row justify-between items-start md:items-center gap-2 ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white'}`}><span>Usar catálogo:</span>
                <select id="selector-cotizacion" className={`p-2 rounded w-full md:w-2/3 ${inputBg}`} onChange={e => { const item = catalogosUnidos.find(i => i.codigo === e.target.value); if(item) setItemTemporal({...itemTemporal, detalle_del_trabajo: `${item.codigo}: ${item.nombre}`, precio_unitario: item.costo_unitario || 0}) }}>
                    <option value="">-- Buscar Insumo/Servicio --</option>
                    {catalogosUnidos.map(i => <option key={i.codigo} value={i.codigo}>{i.codigo} : {i.nombre}</option>)}
                </select>
                </div>
                <form onSubmit={agregarItemTemporal} className="grid grid-cols-1 md:grid-cols-5 gap-2 lg:gap-4 items-end">
                  <div className="md:col-span-2"><label className={`text-[10px] font-bold uppercase ${textMuted}`}>DETALLE</label><input type="text" className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg text-xs lg:text-sm ${inputBg}`} value={itemTemporal.detalle_del_trabajo} onChange={e => setItemTemporal({...itemTemporal, detalle_del_trabajo: e.target.value})} /></div>
                  <div><label className={`text-[10px] font-bold uppercase ${textMuted}`}>CANT.</label><input type="number" step="0.1" className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg text-xs lg:text-sm ${inputBg}`} value={itemTemporal.cantidad} onChange={e => setItemTemporal({...itemTemporal, cantidad: parseFloat(e.target.value) || 0})} /></div>
                  <div><label className={`text-[10px] font-bold uppercase ${textMuted}`}>PRECIO UN.</label><input type="number" className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg text-xs lg:text-sm ${inputBg}`} value={itemTemporal.precio_unitario} onChange={e => setItemTemporal({...itemTemporal, precio_unitario: parseInt(e.target.value) || 0})} /></div>
                  <button type="submit" className="bg-blue-600 text-white font-bold p-2.5 rounded-lg text-sm w-full md:w-auto">+ Ítem</button>
                </form>
              </div>
              <div className={`overflow-x-auto border rounded-2xl shadow-sm ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <table className="w-full text-left border-collapse min-w-[500px]"><thead className="bg-slate-900 text-white text-[10px] lg:text-xs uppercase"><tr><th className="p-3 lg:p-4">Detalle</th><th className="p-3 lg:p-4 text-center">Cant.</th><th className="p-3 lg:p-4 text-right">Precio Un.</th><th className="p-3 lg:p-4 text-right">Total</th><th className="p-3 lg:p-4 text-center"> </th></tr></thead><tbody className={`text-xs lg:text-sm divide-y ${darkMode ? 'divide-slate-700 bg-slate-800' : 'divide-slate-100 bg-white'}`}>{(itemsCotizacion || []).map((item, idx) => (<tr key={idx} className={darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}><td className="p-3 lg:p-4">{item.detalle_del_trabajo}</td><td className="p-3 lg:p-4 text-center">{item.cantidad}</td><td className="p-3 lg:p-4 text-right">${fmt(item.precio_unitario)}</td><td className="p-3 lg:p-4 text-right font-bold">${fmt(item.total_item)}</td><td className="p-3 lg:p-4 text-center"><button onClick={() => editarItem(idx)} className="text-blue-500 mr-2">✏️</button><button onClick={() => eliminarItem(idx)} className="text-red-500">🗑️</button></td></tr>))}</tbody></table>
              </div>
              <div className="flex justify-end"><div className={`w-full md:w-64 p-4 rounded-2xl border space-y-2 text-xs lg:text-sm ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}><div className={`flex justify-between ${textMuted}`}><span>Subtotal:</span><span className="font-semibold">${fmt(subtotalCotiz)}</span></div><div className={`flex justify-between ${textMuted}`}><span>IVA (19%):</span><span className="font-semibold">${fmt(ivaCotiz)}</span></div><div className={`flex justify-between border-t pt-2 text-base lg:text-lg font-black ${darkMode ? 'border-slate-600' : ''}`}><span>Total:</span><span className={colorAzul}>${fmt(totalCotiz)}</span></div></div></div>
              <button onClick={guardarCotizacionFinal} className={`w-full text-white text-base lg:text-lg font-bold p-4 rounded-2xl shadow-md ${editandoCotizacionId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{editandoCotizacionId ? '💾 Actualizar Cotización' : '✅ Guardar Cotización'}</button>
              {editandoCotizacionId && (<button onClick={() => { setEditandoCotizacionId(null); setItemsCotizacion([]); setCotizClienteId(''); }} className={`w-full underline text-xs lg:text-sm text-center block pt-2 ${textMuted}`}>Cancelar Edición</button>)}
            </div>
            <div className="space-y-4">
              <h3 className="text-lg lg:text-xl font-bold">📜 Historial Emitido</h3>
              {(cotizaciones || []).length === 0 ? (<div className={`text-sm ${textMuted}`}>No hay cotizaciones.</div>) : ([...(cotizaciones || [])].reverse().map(cot => { const estaEnProduccion = (ordenes || []).some(o => o.cotizacion_id === cot.id); return (<div key={cot.id} className={`p-4 lg:p-5 rounded-2xl border shadow-sm space-y-3 transition-colors ${cardBg}`}><div className="flex justify-between items-center"><span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${darkMode ? 'bg-blue-900/30 text-sky-300' : 'bg-blue-50 text-blue-600'}`}>CD{new Date().getFullYear()}-{1000 + cot.id}</span><div className="space-x-1 lg:space-x-2"><button onClick={() => cargarParaEditarCotizacion(cot)} className={`text-[10px] lg:text-xs p-1.5 rounded-md font-bold transition-colors ${darkMode ? 'bg-slate-700 text-sky-300' : 'bg-slate-100 text-blue-600'}`}>✏️</button><button onClick={() => eliminarBD('cotizaciones', cot.id)} className={`text-[10px] lg:text-xs p-1.5 rounded-md font-bold transition-colors ${darkMode ? 'bg-slate-700 text-rose-300' : 'bg-slate-100 text-red-600'}`}>🗑️</button></div></div><div><h4 className="font-bold text-sm lg:text-base">{cot.cliente?.alias || cot.cliente?.razon_social}</h4><p className={`text-[10px] lg:text-xs ${textMuted}`}>Vence: {cot.fecha_vencimiento}</p></div><div className={`border-t pt-2 flex flex-col gap-2 ${darkMode ? 'border-slate-700' : ''}`}><div className="flex justify-between items-center"><span className="text-base lg:text-lg font-black">${fmt(cot.total)}</span><button onClick={() => generarPDF(cot)} className="bg-slate-900 text-white text-[10px] lg:text-xs px-3 py-1.5 rounded-lg">📄 PDF</button></div>{estaEnProduccion ? (<button disabled className={`w-full text-xs font-bold p-2.5 rounded-lg border cursor-not-allowed ${darkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>Ya en Taller</button>) : (<button onClick={() => enviarAProduccion(cot)} className={`w-full text-xs font-bold p-2.5 rounded-lg transition-colors border ${darkMode ? 'bg-blue-900/20 hover:bg-blue-900/40 text-sky-300 border-blue-900/50' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'}`}>🚀 Enviar a Producción</button>)}</div></div>); }))}
            </div>
          </div>
        )}

        {/* --- 5. ÓRDENES DE TRABAJO (KANBAN TALLER) --- */}
        {view === 'ordenes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className={`space-y-4 ${user.rol === 'Admin' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              {(ordenes || []).length === 0 ? (<div className={`text-center py-10 rounded-2xl border ${cardBg}`}>No hay trabajos activos.</div>) : ([...(ordenes || [])].reverse().map(ot => { let colorClass = cardBg; let textColor = textHighlight; if (ot.estado === 'Pendiente') { colorClass = darkMode ? 'bg-rose-950/40 border-rose-500/50' : 'bg-rose-100 border-rose-300'; textColor = darkMode ? 'text-rose-200' : 'text-rose-900'; } if (ot.estado === 'En Producción') { colorClass = darkMode ? 'bg-amber-950/40 border-amber-500/50' : 'bg-amber-100 border-amber-300'; textColor = darkMode ? 'text-amber-200' : 'text-amber-900'; } if (ot.estado === 'Terminado') { colorClass = darkMode ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'; textColor = darkMode ? 'text-emerald-100' : 'text-emerald-900'; } const saldos = obtenerSaldosOT(ot); return (<div key={ot.id} className={`p-4 lg:p-6 rounded-2xl border shadow-sm flex flex-col transition-colors ${colorClass} ${textColor}`}><div className={`flex justify-between items-start border-b pb-3 mb-3 border-black/10`}><div><span className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider opacity-70`}>OT-2026-{1000 + (ot.id || 0)}</span><h3 className="text-lg lg:text-xl font-black mt-1 uppercase">{ot.cliente?.alias || ot.cliente?.razon_social}</h3></div><div className="text-right"><span className={`text-[10px] lg:text-xs font-bold uppercase block opacity-70`}>Entrega</span><span className="text-base lg:text-lg font-bold">{ot.fecha_entrega}</span></div></div><p className={`text-xs lg:text-sm font-bold mb-4 whitespace-pre-wrap flex-1`}>{ot.descripcion}</p>{ot.link_diseno && (<div className="mb-4"><a href={ot.link_diseno.startsWith('http') ? ot.link_diseno : `https://${ot.link_diseno}`} target="_blank" rel="noreferrer" className={`inline-flex items-center text-[10px] lg:text-xs font-bold px-3 py-1.5 rounded-lg transition border bg-black/10 hover:bg-black/20 border-black/20`}>🎨 Abrir Archivos / Foto Respaldo</a></div>)}{saldos && user.rol === 'Admin' && (<div className={`mb-4 p-2 lg:p-2.5 rounded-lg border flex justify-between items-center text-[8px] lg:text-[11px] uppercase tracking-wider bg-black/20 border-black/10`}><span className="font-bold">Total: ${fmt(saldos.total)}</span><span className="font-bold">Abonado: ${fmt(saldos.pagado)}</span><span className="font-black">Saldo: ${fmt(saldos.saldo)}</span></div>)}<div className={`flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-black/10`}><select className={`p-2 rounded-lg text-xs lg:text-sm font-bold border focus:outline-none bg-black/20 border-black/10 ${textColor}`} value={ot.estado} onChange={(e) => actualizarEstadoOT(ot, e.target.value)}><option value="Pendiente">Pendiente</option><option value="En Producción">En Producción</option><option value="Terminado">Terminado</option></select><div className="flex space-x-2">{user.rol === 'Admin' && (<><button onClick={() => editarLinkOT(ot)} className={`p-2 rounded-lg text-xs font-bold shadow-sm transition ${darkMode ? 'bg-sky-900/30 hover:bg-sky-900/50 text-sky-300' : 'bg-sky-100 hover:bg-sky-200 text-sky-700'}`}><span className="hidden md:inline">Archivos</span></button><button onClick={() => agendarCalendario(ot)} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg text-xs font-bold shadow-sm transition">📅 <span className="hidden md:inline">Calendario</span></button><button onClick={() => enviarWhatsApp(ot)} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg text-xs font-bold shadow-sm transition">💬 <span className="hidden md:inline">WhatsApp</span></button><button onClick={() => eliminarBD('ordenes', ot.id)} className="bg-rose-500/20 hover:bg-rose-500/40 p-2 rounded-lg text-xs font-bold transition">🗑️</button></>)}</div></div>{ot.estado === 'Terminado' && user.rol === 'Admin' && (<div className={`mt-4 pt-3 border-t border-black/10`}><button onClick={() => cobrarOrden(ot)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs lg:text-sm font-bold p-2.5 rounded-lg transition-colors shadow-sm">💰 Cobrar / Abonar Trabajo</button></div>)}</div>); }))}
            </div>
            {user.rol === 'Admin' && (
              <div className={`p-5 lg:p-6 rounded-3xl border shadow-sm h-fit sticky top-10 transition-colors ${cardBg}`}>
                <h3 className={`text-base lg:text-lg font-bold mb-4 lg:mb-6 border-b pb-4 ${darkMode ? 'border-slate-700' : ''}`}>🛠️ Crear Orden Manual</h3>
                <form onSubmit={guardarOrden} className="space-y-4">
                  <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>1. Cliente</label><select required className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg font-medium text-sm ${inputBg}`} value={nuevaOrden.cliente_id} onChange={e => setNuevaOrden({...nuevaOrden, cliente_id: e.target.value})}><option value="">-- Seleccionar --</option>{(clientes || []).map(c => <option key={c.id} value={c.id}>{c.alias ? `${c.alias} (${c.razon_social})` : c.razon_social}</option>)}</select></div>
                  <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>2. Trabajo a Fabricar</label><textarea required rows="4" className={`w-full mt-1 p-2 lg:p-3 rounded-lg text-sm ${inputBg}`} value={nuevaOrden.descripcion} onChange={e => setNuevaOrden({...nuevaOrden, descripcion: e.target.value})} /></div>
                  <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>Link (Drive/WeTransfer)</label><input type="url" placeholder="https://..." className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg font-medium text-sm ${inputBg}`} value={nuevaOrden.link_diseno} onChange={e => setNuevaOrden({...nuevaOrden, link_diseno: e.target.value})} /></div>
                  <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>3. Entrega Acordada</label><input type="date" required className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg font-medium text-sm ${inputBg}`} value={nuevaOrden.fecha_entrega} onChange={e => setNuevaOrden({...nuevaOrden, fecha_entrega: e.target.value})} /></div>
                  <button type="submit" className="w-full mt-6 bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition">+ Enviar al Taller</button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- 6. FINANZAS Y CAJA --- */}
        {view === 'finanzas' && user.rol === 'Admin' && (
          <div className="space-y-6 lg:space-y-8">
            <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-center ${darkMode ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-indigo-50 border-indigo-200'}`}>
                <div><h2 className="text-2xl font-black">Cierre de Caja Operativa</h2></div>
                <div className="mt-4 sm:mt-0"><input type="month" className={`p-3 rounded-xl font-black border-2 ${inputBg}`} value={mesSeleccionado} onChange={(e) => { setMesSeleccionado(e.target.value); setCategoriaFiltro(null); }} /></div>
            </div>

            {/* BLOQUE SUPERIOR: BALANCE Y TORTA */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className={`p-6 rounded-3xl border flex flex-col justify-center ${cardBg}`}>
                    <h3 className="text-sm font-bold uppercase mb-4 border-b pb-2">📊 Balance: {mesSeleccionado}</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span>Saldo Anterior:</span><span className={`font-bold ${saldoAnterior >= 0 ? colorVerde : colorRojo}`}>${fmt(saldoAnterior)}</span></div>
                        <div className="flex justify-between"><span>💰 Ingresos:</span><span className={`text-lg font-black ${colorVerde}`}>+ ${fmt(ingresosMes)}</span></div>
                        <div className="flex justify-between"><span>💸 Gastos:</span><span className={`text-lg font-black ${colorRojo}`}>- ${fmt(gastosMes)}</span></div>
                        <div className={`pt-4 border-t flex justify-between`}><span className="font-black uppercase">Caja Real:</span><span className={`text-3xl font-black ${saldoCajaMes >= 0 ? colorVerde : colorRojo}`}>${fmt(saldoCajaMes)}</span></div>
                    </div>
                </div>

                <div className={`xl:col-span-2 p-6 rounded-3xl border flex flex-col md:flex-row items-center gap-8 ${cardBg}`}>
                    <div className="flex flex-col items-center">
                        <div className="w-40 h-40 rounded-full shadow-inner border border-black/10" style={{ background: gastosMes > 0 ? `conic-gradient(${gradientStops})` : '#334155' }}></div>
                        {fugasBancariasMes > 0 && (<div className="mt-4 p-2 bg-rose-500/20 text-rose-500 rounded-lg text-center font-bold text-xs border border-rose-500/30">⚠️ Fugas Banco: ${fmt(fugasBancariasMes)}</div>)}
                    </div>
                    <div className="flex-1 w-full">
                        <h3 className="font-black mb-4">Distribución de Gastos</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">{datosTorta.map((dato, i) => (<div key={i} onClick={() => setCategoriaFiltro(categoriaFiltro === dato.categoria ? null : dato.categoria)} className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer ${categoriaFiltro === dato.categoria ? 'bg-indigo-600 text-white' : (darkMode ? 'bg-slate-700/30' : 'bg-slate-50')}`}><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORES_TORTA[i % COLORES_TORTA.length] }}></div><span className="text-xs font-bold truncate max-w-[100px]">{dato.categoria}</span></div><span className="text-xs font-black">${fmt(dato.monto)}</span></div>))}</div>
                    </div>
                </div>
            </div>

            {/* BLOQUE MEDIO: ESCÁNER Y FORMULARIO */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className={`p-6 rounded-3xl border shadow-sm ${darkMode ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-indigo-50 border-indigo-200'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="font-bold text-lg">🤖 Escáner de Cartolas</h3>
                        <label className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded-xl font-bold cursor-pointer text-center w-full sm:w-auto">📄 Subir PDF<input type="file" accept=".pdf" className="hidden" onChange={handleCargarCartola} /></label>
                    </div>
                    {sugerenciasLector.length > 0 && (
                        <div className="mt-6 border-t border-indigo-500/30 pt-4">
                            <button onClick={aprobarSeleccionados} className="w-full bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl mb-4">✅ Aprobar Seleccionados</button>
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">{sugerenciasLector.map((sug, i) => (
                                <div key={i} className={`p-3 rounded-xl border flex flex-wrap items-center gap-3 ${sug.locked ? 'opacity-60 bg-slate-800' : 'bg-slate-800/50'}`}>
                                    {sug.locked ? <span>🔒</span> : <input type="checkbox" className="w-5 h-5 accent-amber-500" checked={sug.checked} onChange={() => modificarSugerencia(i, 'checked', !sug.checked)} />}
                                    <div className="flex-1 min-w-[150px]"><p className="font-bold text-sm truncate">{sug.concepto}</p><span className={`text-[10px] font-black uppercase ${sug.tipo==='Ingreso'?colorVerde:colorRojo}`}>{sug.tipo}: ${fmt(sug.monto)}</span></div>
                                    <select disabled={sug.locked} className={`p-1.5 rounded text-xs ${inputBg}`} value={sug.banco} onChange={(e) => modificarSugerencia(i, 'banco', e.target.value)}>{BANCOS.map(b=><option key={b} value={b}>{b}</option>)}</select>
                                    <select disabled={sug.locked} className={`p-1.5 rounded text-xs ${inputBg}`} value={sug.metodo} onChange={(e) => modificarSugerencia(i, 'metodo', e.target.value)}>{METODOS_PAGO.map(m=><option key={m} value={m}>{m}</option>)}</select>
                                    <select disabled={sug.locked} className={`p-1.5 rounded text-xs font-bold text-amber-500 ${inputBg}`} value={sug.categoria} onChange={(e) => modificarSugerencia(i, 'categoria', e.target.value)}>{sug.tipo === 'Ingreso' ? CAT_INGRESOS.map(c=><option key={c} value={c}>{c}</option>) : CAT_GASTOS.map(c=><option key={c} value={c}>{c}</option>)}</select>
                                    <button onClick={() => setSugerenciasLector(sugerenciasLector.filter((_, idx) => idx !== i))} className="text-rose-500">🗑️</button>
                                </div>
                            ))}</div>
                        </div>
                    )}
                    {sugerenciasLector.length === 0 && (<p className="text-sm opacity-60 mt-4 text-center">Sube la cartola mensual del banco para registrar los movimientos automáticamente.</p>)}
                </div>

                <div className={`p-5 lg:p-6 rounded-3xl border shadow-sm transition-colors ${cardBg}`}>
                    <div className={`flex justify-between items-center mb-4 border-b pb-3 ${darkMode ? 'border-slate-700' : ''}`}><h3 className="text-base lg:text-lg font-bold">{editandoMovimientoId ? '✏️ Corregir Movimiento' : '💸 Registrar Manual'}</h3></div>
                    <form onSubmit={guardarMovimiento} className="space-y-4">
                        <div className="flex gap-2 lg:gap-4 mb-2"><label className={`flex-1 text-center p-2 lg:p-2.5 rounded-xl border-2 cursor-pointer font-bold text-xs lg:text-sm transition-all ${nuevoMov.tipo === 'Ingreso' ? (darkMode ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400' : 'border-emerald-500 bg-emerald-50 text-emerald-700') : darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-400'}`}><input type="radio" className="hidden" name="tipo" value="Ingreso" checked={nuevoMov.tipo === 'Ingreso'} onChange={e => setNuevoMov({...nuevoMov, tipo: e.target.value, categoria: ''})} /> + Ingreso</label><label className={`flex-1 text-center p-2 lg:p-2.5 rounded-xl border-2 cursor-pointer font-bold text-xs lg:text-sm transition-all ${nuevoMov.tipo === 'Gasto' ? (darkMode ? 'border-rose-500 bg-rose-900/20 text-rose-400' : 'border-rose-500 bg-rose-50 text-rose-700') : darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-400'}`}><input type="radio" className="hidden" name="tipo" value="Gasto" checked={nuevoMov.tipo === 'Gasto'} onChange={e => setNuevoMov({...nuevoMov, tipo: e.target.value, categoria: ''})} /> - Gasto</label></div>
                        <div className="grid grid-cols-2 gap-2 lg:gap-4">
                            <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>Estado</label><select required className={`w-full mt-1 p-2 rounded-lg text-xs lg:text-sm font-bold ${inputBg}`} value={nuevoMov.estado_pago} onChange={e => setNuevoMov({...nuevoMov, estado_pago: e.target.value})}><option value="Pagado">Pagado</option><option value="Pendiente">Pendiente</option><option value="Abonado">Abonado</option></select></div>
                            <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>Medio</label><select required className={`w-full mt-1 p-2 rounded-lg text-xs lg:text-sm ${inputBg}`} value={nuevoMov.medio_pago} onChange={e => setNuevoMov({...nuevoMov, medio_pago: e.target.value})}><option value="Transferencia">Transferencia</option><option value="Efectivo">Efectivo</option><option value="Cheque al Día">Cheque al Día</option><option value="Cheque a Fecha">Cheque a Fecha</option><option value="Tarjeta">Tarjeta (Webpay)</option></select></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 lg:gap-4">
                            <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>Clasificación</label><select required className={`w-full mt-1 p-2 rounded-lg text-xs lg:text-sm ${inputBg}`} value={nuevoMov.categoria} onChange={e => setNuevoMov({...nuevoMov, categoria: e.target.value})}><option value="">-- Selecciona --</option>{nuevoMov.tipo === 'Ingreso' ? CAT_INGRESOS.map(cat => <option key={cat} value={cat}>{cat}</option>) : CAT_GASTOS.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                            <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>FECHA</label><input type="date" required className={`w-full mt-1 p-2 rounded-lg font-medium text-xs lg:text-sm ${inputBg}`} value={nuevoMov.fecha} onChange={e => setNuevoMov({...nuevoMov, fecha: e.target.value})} /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 lg:gap-4 items-end">
                            <div className="col-span-2"><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>Descripción</label><input type="text" required placeholder="Ej: Pago factura #120..." className={`w-full mt-1 p-2.5 rounded-lg text-xs lg:text-sm ${inputBg}`} value={nuevoMov.concepto} onChange={e => setNuevoMov({...nuevoMov, concepto: e.target.value})} /></div>
                            <div><label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>MONTO ($)</label><input type="number" required min="1" className={`w-full mt-1 p-2.5 rounded-lg text-sm lg:text-base font-black ${inputBg}`} value={nuevoMov.monto} onChange={e => setNuevoMov({...nuevoMov, monto: e.target.value})} /></div>
                        </div>
                        <button type="submit" className={`w-full font-bold p-3 rounded-xl text-white mt-4 shadow-md transition-colors ${editandoMovimientoId ? 'bg-amber-500 hover:bg-amber-600' : nuevoMov.tipo === 'Ingreso' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>{editandoMovimientoId ? '💾 Aplicar Corrección' : `Registrar ${nuevoMov.tipo}`}</button>
                        {editandoMovimientoId && (<button type="button" onClick={() => { setEditandoMovimientoId(null); setNuevoMov({ tipo: 'Ingreso', categoria: '', monto: '', concepto: '', fecha: new Date().toISOString().split('T')[0], estado_pago: 'Pagado', medio_pago: 'Transferencia' }); }} className={`w-full underline text-[10px] lg:text-xs text-center block pt-2 ${textMuted}`}>Cancelar Edición</button>)}
                    </form>
                </div>
            </div>

            {/* BLOQUE INFERIOR: TABLA CON BORRADO MASIVO */}
            <div className={`rounded-3xl border overflow-x-auto ${cardBg}`}>
                <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
                    <h3 className="font-bold text-lg">📄 Historial de Movimientos</h3>
                    {movsSeleccionados.length > 0 && (
                        <button onClick={eliminarMovimientosMasivo} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-md">
                            🗑️ Eliminar {movsSeleccionados.length} seleccionados
                        </button>
                    )}
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="border-b">
                        <tr>
                            <th className="p-4 w-10 text-center"><input type="checkbox" className="w-4 h-4" checked={movimientosA_Mostrar.length > 0 && movsSeleccionados.length === movimientosA_Mostrar.length} onChange={toggleSelectAllMovs} /></th>
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Detalle</th>
                            <th className="p-4 text-right">Monto</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>{movimientosA_Mostrar.length === 0 ? (<tr><td colSpan="5" className="p-6 text-center opacity-50">No hay movimientos en este periodo.</td></tr>) : [...movimientosA_Mostrar].sort((a,b)=>b.id-a.id).map(mov=>(
                        <tr key={mov.id} className={`border-b border-slate-200/20 ${movsSeleccionados.includes(mov.id) ? (darkMode ? 'bg-rose-900/20' : 'bg-rose-50') : (darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50')}`}>
                            <td className="p-4 text-center"><input type="checkbox" className="w-4 h-4 cursor-pointer" checked={movsSeleccionados.includes(mov.id)} onChange={() => toggleSeleccionMov(mov.id)} /></td>
                            <td className="p-4 text-xs text-slate-400">{mov.fecha}</td>
                            <td className="p-4 font-bold"><div className="truncate w-48">{mov.concepto}</div><span className="text-[9px] text-slate-400 uppercase">{mov.categoria} | {mov.medio_pago}</span></td>
                            <td className={`p-4 text-right font-black ${mov.tipo==='Ingreso'?colorVerde:colorRojo}`}>${fmt(mov.monto)}</td>
                            <td className="p-4 text-center flex flex-col lg:flex-row justify-center gap-2"><button onClick={() => { setEditandoMovimientoId(mov.id); setNuevoMov(mov); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`font-bold text-xs p-1.5 rounded ${darkMode ? 'bg-slate-700 text-sky-300' : 'bg-slate-100 text-blue-500'}`}>✏️ Editar</button></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
          </div>
        )}

        {/* --- 7. USUARIOS (ADMIN) --- */}
        {view === 'usuarios' && user.rol === 'Admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4">
                <div className={`rounded-3xl border overflow-x-auto ${cardBg}`}>
                    <table className="w-full text-left text-sm">
                        <thead className="border-b"><tr><th className="p-4">Usuario</th><th className="p-4">Nivel de Acceso</th><th className="p-4 text-center">Acciones</th></tr></thead>
                        <tbody>
                            {(usuarios || []).map(u => (
                                <tr key={u.id} className={`border-b border-slate-200/20 ${darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                                    <td className="p-4 font-black">{u.username.toUpperCase()}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.rol === 'Admin' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{u.rol}</span></td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => { setEditandoUsuarioId(u.id); setNuevoUsuario({username: u.username, password: '', rol: u.rol}); window.scrollTo({ top: 0, behavior: 'smooth' });}} className={`font-bold text-xs p-1.5 rounded mr-2 ${darkMode ? 'bg-slate-700 text-sky-300' : 'bg-slate-100 text-blue-500'}`}>Cambiar Clave</button>
                                        <button onClick={() => eliminarBD('usuarios', u.id)} className={`font-bold text-xs p-1.5 rounded ${darkMode ? 'bg-slate-700 text-rose-300' : 'bg-slate-100 text-red-400'}`}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className={`p-5 lg:p-6 rounded-3xl border h-fit sticky top-10 transition-colors ${cardBg}`}>
                <h3 className={`text-base lg:text-lg font-bold mb-4 pb-4 border-b ${darkMode ? 'border-slate-700' : ''}`}>{editandoUsuarioId ? '✏️ Editar Usuario' : '➕ Crear Nuevo Usuario'}</h3>
                <form onSubmit={guardarUsuario} className="space-y-4">
                    <div>
                        <label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>Nombre de Usuario</label>
                        <input type="text" required disabled={editandoUsuarioId !== null} className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg font-bold ${inputBg} ${editandoUsuarioId ? 'opacity-50 cursor-not-allowed' : ''}`} value={nuevoUsuario.username} onChange={e => setNuevoUsuario({...nuevoUsuario, username: e.target.value.toLowerCase()})} placeholder="ej: taller_juan" />
                    </div>
                    <div className="relative">
                        <label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>{editandoUsuarioId ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso'}</label>
                        <input type={showUserPassword ? "text" : "password"} required={!editandoUsuarioId} className={`w-full mt-1 p-2 lg:p-2.5 pr-10 rounded-lg ${inputBg}`} value={nuevoUsuario.password} onChange={e => setNuevoUsuario({...nuevoUsuario, password: e.target.value})} placeholder={editandoUsuarioId ? 'Escribe para cambiar...' : '...'} />
                        <button type="button" onClick={() => setShowUserPassword(!showUserPassword)} className="absolute right-3 top-8 text-lg opacity-70 hover:opacity-100">{showUserPassword ? "🙈" : "👁️"}</button>
                    </div>
                    <div>
                        <label className={`text-[10px] lg:text-xs font-semibold uppercase ${textMuted}`}>Permisos</label>
                        <select required className={`w-full mt-1 p-2 lg:p-2.5 rounded-lg font-bold ${inputBg}`} value={nuevoUsuario.rol} onChange={e => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}>
                            <option value="Taller">Taller (Solo Órdenes y Bodega)</option>
                            <option value="Admin">Admin (Control Total de Empresa)</option>
                        </select>
                    </div>
                    <button type="submit" className={`w-full text-white font-bold p-3 rounded-lg ${editandoUsuarioId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>{editandoUsuarioId ? 'Guardar Cambios' : '+ Crear Acceso'}</button>
                    {editandoUsuarioId && (<button type="button" onClick={() => { setEditandoUsuarioId(null); setNuevoUsuario({username: '', password: '', rol: 'Taller'}); }} className={`w-full underline text-[10px] lg:text-xs pt-2 ${textMuted}`}>Cancelar</button>)}
                </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() { return ( <ErrorBoundary><MainApp /></ErrorBoundary> ); }
