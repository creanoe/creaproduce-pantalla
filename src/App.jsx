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

// --- CONEXIÓN A LA NUBE DE RENDER ---
const API_URL = "https://creadesign-backend.onrender.com";

const CATALOGO_CREADESIGN = [{ codigo: 'ADH-01', nombre: 'Adhesivo Brillante', categoria: 'Adhesivos', unidad: 'MT' }, { codigo: 'LED-01', nombre: 'Módulo LED 12v', categoria: 'Insumos', unidad: 'UN' }, { codigo: 'CNC-01', nombre: 'Corte Router CNC', categoria: 'Servicios', unidad: 'SV' }];
const CAT_INGRESOS = ["Pago de Trabajo", "Abono de Trabajo", "Impresión y Producción", "Otros Ingresos"];
const CAT_GASTOS = ["Materiales y Sustratos", "Personal", "Combustible y Peajes", "Transporte y Encomiendas", "Colaciones en Terreno", "Gasto Oficina", "Gerencia", "Arriendo Taller", "Otros Gastos"];
const BANCOS = ["Santander", "BancoEstado", "Caja Fuerte / Efectivo", "Otro"];
const METODOS_PAGO = ["Transferencia", "Tarjeta de Crédito", "Tarjeta de Débito", "Efectivo", "Línea de Crédito", "Cheque", "Cobro Automático", "Por Pagar (Crédito Proveedor)"];
const COLORES_TORTA = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
const fmt = (val) => { const n = Number(val); return isNaN(n) ? "0" : n.toLocaleString('es-CL'); };

function MainApp() {
  const [user, setUser] = useState(null); 
  const [loginData, setLoginRequest] = useState({ username: '', password: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [darkMode, setDarkMode] = useState(true); 
  const [view, setView] = useState('dashboard'); 

  const [materiales, setMateriales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [movimientos, setMovimientos] = useState([]); 
  
  const [sugerenciasLector, setSugerenciasLector] = useState([]); 
  const [archivosProcesados, setArchivosProcesados] = useState([]); 
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toISOString().slice(0, 7)); 
  const [categoriaFiltro, setCategoriaFiltro] = useState(null); 
  const [facturaEnRevision, setFacturaEnRevision] = useState(null);
  
  const [procesandoFactura, setProcesandoFactura] = useState(false);

  const [nuevoMaterial, setNuevoMaterial] = useState({ codigo: '', nombre: '', categoria: '', stock_actual: 0, unidad_medida: 'UN' });
  const [nuevoCliente, setNuevoCliente] = useState({ razon_social: '', rut: '', alias: '', email: '', telefono: '', direccion: '' });
  const [nuevoMov, setNuevoMov] = useState({ tipo: 'Ingreso', categoria: '', monto: '', concepto: '', fecha: new Date().toISOString().split('T')[0], estado_pago: 'Pagado', medio_pago: 'Transferencia' }); 

  const [editandoMaterialId, setEditandoMaterialId] = useState(null);
  const [editandoClienteId, setEditandoClienteId] = useState(null);
  const [editandoMovimientoId, setEditandoMovimientoId] = useState(null);

  const [cotizClienteId, setCotizClienteId] = useState('');
  const [itemsCotizacion, setItemsCotizacion] = useState([]);
  const [itemTemporal, setItemTemporal] = useState({ cantidad: 1, detalle_del_trabajo: '', precio_unitario: 0 });

  const cargarTodo = () => {
    const fetchSeguro = (url, setter) => { fetch(url).then(res => res.ok ? res.json() : []).then(data => { if (Array.isArray(data)) setter(data.filter(item => item !== null && typeof item === 'object')); else setter([]); }).catch(() => setter([])); };
    fetchSeguro(`${API_URL}/materiales/`, setMateriales);
    fetchSeguro(`${API_URL}/clientes/`, setClientes);
    fetchSeguro(`${API_URL}/cotizaciones/`, setCotizaciones);
    fetchSeguro(`${API_URL}/ordenes/`, setOrdenes);
    fetchSeguro(`${API_URL}/movimientos/`, setMovimientos);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginData) })
    .then(res => { if (!res.ok) throw new Error("Credenciales"); return res.json(); })
    .then(data => { setUser(data); cargarTodo(); setView(data.rol === 'Admin' ? 'dashboard' : 'ordenes'); })
    .catch(() => alert("Acceso denegado."));
  };

  const themeBg = darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardBg = darkMode ? "bg-slate-800 border-slate-700 shadow-md text-slate-100" : "bg-white border-slate-200 shadow-sm text-slate-800";
  const inputBg = darkMode ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-800";
  const colorRojo = darkMode ? "text-rose-400" : "text-rose-600";
  const colorVerde = darkMode ? "text-emerald-400" : "text-emerald-600";

  // --- MATEMÁTICAS FINANCIERAS ---
  const trabajosPendientes = (ordenes || []).filter(o => o.estado === 'Pendiente').length;
  const trabajosProduccion = (ordenes || []).filter(o => o.estado === 'En Producción').length;

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

  // --- LECTORES PDF / XML (CARTOLAS Y FACTURAS) ---
  const handleCargarCartola = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (archivosProcesados.includes(file.name)) { e.target.value = ''; return alert(`⚠️ Archivo duplicado: "${file.name}"`); }
    alert("🤖 Escaneando cartola en la nube...");
    const formData = new FormData(); formData.append("file", file);
    try {
        const res = await fetch(`${API_URL}/upload-cartola/`, { method: 'POST', body: formData }); const data = await res.json();
        if (data.sugerencias && data.sugerencias.length > 0) { setSugerenciasLector(data.sugerencias.map(s => ({ ...s, checked: true, banco: s.banco_detectado || 'BancoEstado', metodo: s.locked ? 'Cobro Automático' : 'Transferencia' }))); setArchivosProcesados([...archivosProcesados, file.name]); } 
        else alert(`⚠️ Fallo del servidor:\n${data.error || JSON.stringify(data)}`);
    } catch (error) { alert("Error de red. ¿Está encendido el servidor en Render?"); } e.target.value = '';
  };

  const modificarSugerencia = (idx, c, v) => { const nuevas = [...sugerenciasLector]; nuevas[idx][c] = v; setSugerenciasLector(nuevas); };
  
  const aprobarSeleccionados = async () => {
      const aAprobar = sugerenciasLector.filter(s => s.checked); if (aAprobar.length === 0) return;
      try {
          await Promise.all(aAprobar.map(sug => fetch(`${API_URL}/movimientos/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: sug.tipo, categoria: sug.categoria, monto: sug.monto, concepto: `[${sug.banco} | ${sug.metodo}] ${sug.concepto}`, fecha: new Date().toISOString().split('T')[0], estado_pago: sug.metodo === 'Tarjeta de Crédito' ? 'Pendiente' : 'Pagado', medio_pago: sug.metodo }) })));
          cargarTodo(); setSugerenciasLector(sugerenciasLector.filter(s => !s.checked)); alert("✅ Movimientos sincronizados en la Nube!");
      } catch (e) { alert("Error al sincronizar."); }
  };

  const handleCargarFactura = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (archivosProcesados.includes(file.name)) { e.target.value = ''; return alert(`⚠️ La factura "${file.name}" ya fue procesada.`); }
    alert("🤖 Extrayendo información en la nube...");
    const formData = new FormData(); formData.append("file", file);
    try {
        const res = await fetch(`${API_URL}/upload-factura/`, { method: 'POST', body: formData }); const data = await res.json();
        // EL NUEVO CHISMOSO:
        if (data.proveedor) { 
            setFacturaEnRevision({ proveedor_rut: data.proveedor.rut, proveedor_nombre: data.proveedor.razon_social, total: data.total, metodo_pago: 'Transferencia', estado_pago: 'Pagado', items: data.items, archivo_nombre: file.name }); 
        } else {
            alert(`⚠️ Error del Servidor:\n${data.error || JSON.stringify(data)}`);
        }
    } catch (error) { alert("Error de red. ¿Está encendido el servidor en Render?"); } e.target.value = '';
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
        cargarTodo(); setArchivosProcesados([...archivosProcesados, facturaEnRevision.archivo_nombre]); setFacturaEnRevision(null); alert("✅ Datos sincronizados con éxito en la nube.");
    } catch (error) { alert("Error al guardar."); }
    finally { setProcesandoFactura(false); }
  };

  // --- CRUD BÁSICO ---
  const guardarMovimiento = (e) => { e.preventDefault(); fetch(editandoMovimientoId ? `${API_URL}/movimientos/${editandoMovimientoId}` : `${API_URL}/movimientos/`, { method: editandoMovimientoId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...nuevoMov, monto: parseInt(nuevoMov.monto)||0 }) }).then(() => { cargarTodo(); setNuevoMov({ tipo: 'Ingreso', categoria: '', monto: '', concepto: '', fecha: new Date().toISOString().split('T')[0], estado_pago: 'Pagado', medio_pago: 'Transferencia' }); setEditandoMovimientoId(null); }); };
  const guardarMaterial = (e) => { e.preventDefault(); fetch(editandoMaterialId ? `${API_URL}/materiales/${editandoMaterialId}` : `${API_URL}/materiales/`, { method: editandoMaterialId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoMaterial) }).then(() => { cargarTodo(); setNuevoMaterial({ codigo: '', nombre: '', categoria: '', stock_actual: 0, unidad_medida: 'UN' }); setEditandoMaterialId(null); }); };
  const guardarCliente = (e) => { e.preventDefault(); fetch(editandoClienteId ? `${API_URL}/clientes/${editandoClienteId}` : `${API_URL}/clientes/`, { method: editandoClienteId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoCliente) }).then(() => { cargarTodo(); setNuevoCliente({ razon_social: '', rut: '', alias: '', email: '', telefono: '', direccion: '' }); setEditandoClienteId(null); }); };
  const eliminarBD = (ruta, id) => { if(window.confirm("¿Eliminar de la nube?")) fetch(`${API_URL}/${ruta}/${id}`, { method: 'DELETE' }).then(() => cargarTodo()); };

  // --- COTIZACIONES Y ORDENES ---
  const agregarItemCotiz = () => { if (itemTemporal.detalle_del_trabajo && itemTemporal.precio_unitario > 0) { setItemsCotizacion([...itemsCotizacion, { ...itemTemporal, total_item: itemTemporal.cantidad * itemTemporal.precio_unitario }]); setItemTemporal({ cantidad: 1, detalle_del_trabajo: '', precio_unitario: 0 }); } };
  const guardarCotizacion = () => { if (!cotizClienteId || itemsCotizacion.length === 0) return alert("Faltan datos"); const subtotal = itemsCotizacion.reduce((sum, item) => sum + item.total_item, 0); const iva = Math.round(subtotal * 0.19); fetch(`${API_URL}/cotizaciones/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cliente_id: parseInt(cotizClienteId), fecha_emision: new Date().toISOString().split('T')[0], subtotal, iva, total: subtotal+iva, estado: 'Borrador', detalles: itemsCotizacion }) }).then(() => { cargarTodo(); setItemsCotizacion([]); setCotizClienteId(''); setView('cotizaciones'); }); };
  const generarPDF = (cot) => { const f = `CD${new Date().getFullYear()}-${1000+cot.id}`; let html = `<!DOCTYPE html><html><head><title>Cot_${f}</title><style>body{font-family:Arial;padding:30px;font-size:13px} .box{border:1px solid #000;width:100%;border-collapse:collapse;margin-bottom:20px} .box td, .box th{border:1px solid #000;padding:8px} th{background:#204c86;color:#fff}</style></head><body><h2>CREAdesign - Cotización ${f}</h2><table class="box"><tr><td>Cliente: ${cot.cliente?.razon_social}</td><td>RUT: ${cot.cliente?.rut}</td></tr></table><table class="box"><tr><th>Cant</th><th>Detalle</th><th>Total</th></tr>${cot.detalles.map(d=>`<tr><td>${d.cantidad}</td><td>${d.detalle_del_trabajo}</td><td>$${fmt(d.total_item)}</td></tr>`).join('')}</table><h3>TOTAL: $${fmt(cot.total)}</h3></body><script>setTimeout(()=>window.print(),500);</script></html>`; const v = window.open('','_blank'); v.document.write(html); v.document.close(); };
  const enviarAProduccion = async (cot) => {
    if(window.confirm("¿Enviar a Taller y descontar stock en la nube?")) {
        let actStock = [];
        for (let item of (cot.detalles || [])) {
            const mat = materiales.find(m => m.codigo === item.detalle_del_trabajo.split(':')[0].trim());
            if (mat && mat.categoria !== 'Servicios') actStock.push({ ...mat, stock_actual: mat.stock_actual - item.cantidad });
        }
        const abono = window.prompt(`¿Abono? Sugerido: $${fmt(Math.round((cot.total||0)/2))}`, Math.round((cot.total||0)/2)); if(abono===null) return;
        try {
            await Promise.all(actStock.map(mat => fetch(`${API_URL}/materiales/${mat.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mat) })));
            const resOT = await fetch(`${API_URL}/ordenes/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cliente_id: cot.cliente?.id, cotizacion_id: cot.id, descripcion: `(Cot. CD-${1000+cot.id})\n${cot.detalles.map(d=>`${d.cantidad}x ${d.detalle_del_trabajo}`).join('\n')}`, fecha_entrega: new Date().toISOString().split('T')[0], estado: 'Pendiente', link_diseno: '' }) });
            const ot = await resOT.json();
            if (parseInt(abono)>0) await fetch(`${API_URL}/movimientos/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: 'Ingreso', categoria: 'Impresión y Producción', monto: parseInt(abono), concepto: `Anticipo OT-${1000+ot.id}`, fecha: new Date().toISOString().split('T')[0], estado_pago: 'Pagado', medio_pago: 'Transferencia' }) });
            cargarTodo(); alert('🚀 En Taller'); setView('ordenes');
        } catch (e) { alert("Error."); }
    }
  };
  const actualizarEstadoOT = (orden, nuevoEstado) => { fetch(`${API_URL}/ordenes/${orden.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...orden, estado: nuevoEstado }) }).then(() => cargarTodo()); };

  // --- RENDER ---
  if (!user) return (<div className="min-h-screen bg-[#0a1120] flex items-center justify-center p-4"><form onSubmit={handleLogin} className="bg-[#111c30] p-10 rounded-[2rem] w-full max-w-md space-y-4 shadow-2xl"><h1 className="text-white text-3xl font-bold text-center mb-6">CREAproduce</h1><input required className="w-full bg-[#1a2641] text-white p-4 rounded-xl" placeholder="Usuario" onChange={e=>setLoginRequest({...loginData, username: e.target.value})} /><input required type="password" className="w-full bg-[#1a2641] text-white p-4 rounded-xl" placeholder="Password" onChange={e=>setLoginRequest({...loginData, password: e.target.value})} /><button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">Entrar</button></form></div>);

  return (
    <div className={`flex min-h-screen font-sans ${themeBg}`}>
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="p-6 flex justify-between items-center"><div><h2 className="text-xl font-bold">CREAdesign</h2><p className="text-xs text-emerald-400">⚡ Conectado a la Nube</p></div><button onClick={()=>setSidebarOpen(false)} className="lg:hidden">✕</button></div>
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {user.rol === 'Admin' && <button onClick={()=>{setView('dashboard');setSidebarOpen(false)}} className={`w-full text-left p-3 rounded-xl ${view==='dashboard'?'bg-blue-600':'text-slate-400'}`}>📊 Panel Principal</button>}
          <button onClick={()=>{setView('bodega');setSidebarOpen(false)}} className={`w-full text-left p-3 rounded-xl ${view==='bodega'?'bg-blue-600':'text-slate-400'}`}>📦 Bodega y Stock</button>
          {user.rol === 'Admin' && <><button onClick={()=>{setView('clientes');setSidebarOpen(false)}} className={`w-full text-left p-3 rounded-xl ${view==='clientes'?'bg-blue-600':'text-slate-400'}`}>👥 Clientes</button>
          <button onClick={()=>{setView('cotizaciones');setSidebarOpen(false)}} className={`w-full text-left p-3 rounded-xl ${view==='cotizaciones'?'bg-blue-600':'text-slate-400'}`}>📄 Cotizaciones</button></>}
          <button onClick={()=>{setView('ordenes');setSidebarOpen(false)}} className={`w-full text-left p-3 rounded-xl ${view==='ordenes'?'bg-blue-600':'text-slate-400'}`}>🛠️ Órdenes de Trabajo</button>
          {user.rol === 'Admin' && <button onClick={()=>{setView('finanzas');setSidebarOpen(false)}} className={`w-full text-left p-3 rounded-xl ${view==='finanzas'?'bg-blue-600':'text-slate-400'}`}>💰 Finanzas y Caja</button>}
          <div className="pt-10"><button onClick={()=>setUser(null)} className="w-full text-left p-3 text-rose-400 font-bold">🚪 Cerrar Sesión</button></div>
        </nav>
      </aside>

      {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden"></div>}

      <main className="flex-1 p-4 lg:p-10 overflow-y-auto min-w-0">
        <header className="flex justify-between items-center mb-6 lg:mb-10"><div className="flex gap-4"><button onClick={()=>setSidebarOpen(true)} className={`lg:hidden p-2 rounded border ${cardBg}`}>☰</button><h2 className="text-2xl font-black capitalize">{view}</h2></div><div className="flex gap-4"><button onClick={()=>setDarkMode(!darkMode)} className={`px-4 py-2 rounded-full border ${cardBg}`}>{darkMode?'☀️':'🌙'}</button></div></header>

        {view === 'dashboard' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className={`p-6 rounded-3xl border ${darkMode?'bg-emerald-900/10 border-emerald-900/30':'bg-emerald-50 border-emerald-200'}`}><p className="text-xs font-bold text-emerald-500">CAJA DEL MES</p><h3 className={`text-3xl font-black ${saldoCajaMes>=0?colorVerde:colorRojo}`}>${fmt(saldoCajaMes)}</h3></div><div className={`p-6 rounded-3xl border ${cardBg}`}><p className="text-xs font-bold text-slate-500">TRABAJOS PENDIENTES</p><h3 className="text-3xl font-black text-blue-500">{trabajosPendientes}</h3></div><div className={`p-6 rounded-3xl border ${cardBg}`}><p className="text-xs font-bold text-slate-500">EN PRODUCCIÓN</p><h3 className="text-3xl font-black text-amber-500">{trabajosProduccion}</h3></div></div>)}

        {/* ================= PESTAÑA: BODEGA ================= */}
        {view === 'bodega' && (
          <div className="space-y-6">
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

            <div className={`p-6 rounded-3xl border ${cardBg}`}>
              <h3 className="text-lg font-bold mb-4">{editandoMaterialId ? '✏️ Editar Material' : '📦 Ingreso Manual a Bodega'}</h3>
              <form onSubmit={guardarMaterial} className="flex flex-col sm:flex-row gap-2 mb-6"><input className={`w-full sm:w-24 p-2.5 rounded-lg border font-mono text-sm focus:outline-none ${inputBg}`} required placeholder="Código" value={nuevoMaterial.codigo} onChange={e=>setNuevoMaterial({...nuevoMaterial, codigo: e.target.value})}/><input className={`flex-1 p-2.5 rounded-lg border font-bold text-sm focus:outline-none ${inputBg}`} required placeholder="Nombre" value={nuevoMaterial.nombre} onChange={e=>setNuevoMaterial({...nuevoMaterial, nombre: e.target.value})}/><select className={`p-2.5 rounded-lg border text-sm focus:outline-none ${inputBg}`} required value={nuevoMaterial.categoria} onChange={e=>setNuevoMaterial({...nuevoMaterial, categoria: e.target.value})}><option value="">Categoría</option><option value="Sustratos">Sustratos</option><option value="Adhesivos">Adhesivos</option><option value="Servicios">Servicios</option><option value="Insumos Varios">Insumos Varios</option></select><input className={`w-full sm:w-16 p-2.5 rounded-lg border font-bold text-sm text-center uppercase focus:outline-none ${inputBg}`} required placeholder="UM" value={nuevoMaterial.unidad_medida} onChange={e=>setNuevoMaterial({...nuevoMaterial, unidad_medida: e.target.value.toUpperCase()})}/><input type="number" className={`w-full sm:w-20 p-2.5 rounded-lg border font-black text-center focus:outline-none ${inputBg}`} required placeholder="Stock" value={nuevoMaterial.stock_actual} onChange={e=>setNuevoMaterial({...nuevoMaterial, stock_actual: e.target.value})}/><button className="bg-blue-600 text-white font-bold px-4 py-2.5 rounded-lg">Guardar</button></form>
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className={darkMode ? 'bg-slate-700/50 border-b border-slate-600' : 'bg-slate-50 border-b'}><tr><th className="p-4">Cód</th><th className="p-4">Material</th><th className="p-4 text-center">U.M.</th><th className="p-4 text-center">Stock</th><th className="p-4"></th></tr></thead><tbody>{[...materiales].sort((a,b)=>b.id-a.id).map(m=><tr key={m.id} className={`border-b ${darkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'}`}><td className="p-4 font-mono text-xs text-sky-500">{m.codigo}</td><td className="p-4 font-bold">{m.nombre}</td><td className="p-4 text-center text-xs font-bold text-slate-400">{m.unidad_medida || 'UN'}</td><td className="p-4 text-center"><span className={`px-3 py-1 rounded-full font-black text-xs ${m.stock_actual<=5?'bg-rose-500/20 text-rose-500':'bg-emerald-500/20 text-emerald-500'}`}>{m.stock_actual}</span></td><td className="p-4 text-center"><button onClick={()=>eliminarBD('materiales', m.id)} className="text-rose-500 bg-rose-500/10 p-2 rounded-lg">🗑️</button></td></tr>)}</tbody></table></div>
            </div>
          </div>
        )}

        {view === 'clientes' && (
            <div className={`p-6 rounded-3xl border ${cardBg}`}>
                <form onSubmit={guardarCliente} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"><input required className={`p-2 rounded border ${inputBg}`} placeholder="RUT" value={nuevoCliente.rut} onChange={e=>setNuevoCliente({...nuevoCliente,rut:e.target.value})}/><input required className={`md:col-span-2 p-2 rounded border ${inputBg}`} placeholder="Empresa" value={nuevoCliente.razon_social} onChange={e=>setNuevoCliente({...nuevoCliente,razon_social:e.target.value})}/><button className="bg-blue-600 text-white p-2 rounded font-bold">Guardar</button></form>
                <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b"><tr><th className="p-3">RUT</th><th className="p-3">Empresa</th><th className="p-3"></th></tr></thead><tbody>{[...clientes].sort((a,b)=>b.id-a.id).map(c=><tr key={c.id} className="border-b border-slate-200/20"><td className="p-3">{c.rut}</td><td className="p-3 font-bold">{c.razon_social}</td><td className="p-3 text-right"><button onClick={()=>eliminarBD('clientes', c.id)} className="text-rose-500">🗑️</button></td></tr>)}</tbody></table></div>
            </div>
        )}

        {view === 'cotizaciones' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${cardBg}`}>
              <div className="flex flex-col md:flex-row gap-4 mb-6"><select className={`flex-1 p-3 rounded-xl border ${inputBg}`} value={cotizClienteId} onChange={e=>setCotizClienteId(e.target.value)}><option value="">Seleccionar Cliente...</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}</select></div>
              <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-3 ${darkMode?'bg-slate-900/50':'bg-slate-50'}`}><select className={`p-2 rounded border ${inputBg}`} onChange={e=>{const cat=CATALOGO_CREADESIGN.find(c=>c.codigo===e.target.value); if(cat) setItemTemporal({...itemTemporal, detalle_del_trabajo: `${cat.codigo}: ${cat.nombre}`})}}><option value="">Catálogo...</option>{CATALOGO_CREADESIGN.map(c=><option key={c.codigo} value={c.codigo}>{c.nombre}</option>)}</select><input type="number" min="1" className={`w-20 p-2 rounded border ${inputBg}`} value={itemTemporal.cantidad} onChange={e=>setItemTemporal({...itemTemporal, cantidad: parseInt(e.target.value)||1})} /><input type="text" placeholder="Detalle" className={`flex-1 p-2 rounded border ${inputBg}`} value={itemTemporal.detalle_del_trabajo} onChange={e=>setItemTemporal({...itemTemporal, detalle_del_trabajo: e.target.value})} /><input type="number" placeholder="Precio" className={`w-32 p-2 rounded border ${inputBg}`} value={itemTemporal.precio_unitario} onChange={e=>setItemTemporal({...itemTemporal, precio_unitario: parseInt(e.target.value)||0})} /><button onClick={agregarItemCotiz} className="bg-emerald-600 text-white px-4 py-2 rounded font-bold">Añadir</button></div>
              {itemsCotizacion.length>0 && (<div className="mt-4"><table className="w-full text-sm border"><thead><tr><th className="p-2 border-b">Cant</th><th className="p-2 border-b">Detalle</th><th className="p-2 border-b text-right">Total</th></tr></thead><tbody>{itemsCotizacion.map((it,i)=><tr key={i}><td className="p-2 border-b font-bold">{it.cantidad}</td><td className="p-2 border-b">{it.detalle_del_trabajo}</td><td className="p-2 border-b text-right font-black">${fmt(it.total_item)}</td></tr>)}</tbody></table><div className="mt-4 text-right"><p className="text-xl font-black text-blue-500">TOTAL: ${fmt(Math.round(itemsCotizacion.reduce((s,i)=>s+i.total_item,0)*1.19))}</p><button onClick={guardarCotizacion} className="mt-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Guardar y Generar PDF</button></div></div>)}
            </div>
            <div className={`p-6 rounded-3xl border overflow-x-auto ${cardBg}`}><table className="w-full text-sm text-left"><thead className="border-b"><tr><th className="p-3">Folio</th><th className="p-3">Cliente</th><th className="p-3">Total</th><th className="p-3 text-center">Acciones</th></tr></thead><tbody>{[...cotizaciones].sort((a,b)=>b.id-a.id).map(cot=><tr key={cot.id} className="border-b border-slate-200/20"><td className="p-3 font-bold text-blue-500">CD-{1000+cot.id}</td><td className="p-3">{cot.cliente?.razon_social}</td><td className="p-3 font-black">${fmt(cot.total)}</td><td className="p-3 flex justify-center gap-2"><button onClick={()=>generarPDF(cot)} className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white px-3 py-1 rounded font-bold">PDF</button><button onClick={()=>enviarAProduccion(cot)} className="bg-emerald-600 text-white px-3 py-1 rounded font-bold">A Taller</button></td></tr>)}</tbody></table></div>
          </div>
        )}

        {view === 'ordenes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {['Pendiente', 'En Producción', 'Terminado'].map(estado=>(
                <div key={estado} className={`p-4 rounded-3xl border ${cardBg}`}>
                    <h3 className="font-black mb-4 pb-2 border-b border-slate-200/20">{estado}</h3>
                    <div className="space-y-3">{[...ordenes.filter(o=>o.estado===estado)].sort((a,b)=>b.id-a.id).map(o=>(
                        <div key={o.id} className={`p-4 rounded-xl border shadow-sm ${darkMode?'bg-slate-900/50 border-slate-700':'bg-slate-50 border-slate-200'}`}>
                            <div className="flex justify-between mb-2"><span className="font-bold text-blue-500 text-xs">OT-{1000+o.id}</span></div>
                            <h4 className="font-bold text-sm">{o.cliente?.razon_social}</h4>
                            <pre className="text-[10px] mt-2 whitespace-pre-wrap font-sans opacity-70">{o.descripcion}</pre>
                            {estado==='Pendiente' && <button onClick={()=>actualizarEstadoOT(o,'En Producción')} className="mt-3 w-full bg-amber-500 text-white text-xs font-bold py-2 rounded">Iniciar Producción</button>}
                            {estado==='En Producción' && <button onClick={()=>actualizarEstadoOT(o,'Terminado')} className="mt-3 w-full bg-emerald-600 text-white text-xs font-bold py-2 rounded">Terminar Trabajo</button>}
                        </div>
                    ))}</div>
                </div>
            ))}
          </div>
        )}

        {/* ================= PESTAÑA FINANZAS ================= */}
        {view === 'finanzas' && user.rol === 'Admin' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-center ${darkMode ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-indigo-50 border-indigo-200'}`}>
                <div><h2 className="text-2xl font-black">Cierre de Caja Operativa</h2></div>
                <div className="mt-4 sm:mt-0"><input type="month" className={`p-3 rounded-xl font-black border-2 ${inputBg}`} value={mesSeleccionado} onChange={(e) => { setMesSeleccionado(e.target.value); setCategoriaFiltro(null); }} /></div>
            </div>

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

            <div className={`p-6 rounded-3xl border shadow-sm ${darkMode ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-indigo-50 border-indigo-200'}`}>
                <div className="flex justify-between items-center"><h3 className="font-bold text-lg">🤖 Escáner de Cartolas</h3><label className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold cursor-pointer">📄 Subir Cartola<input type="file" accept=".pdf" className="hidden" onChange={handleCargarCartola} /></label></div>
                {sugerenciasLector.length > 0 && (
                    <div className="mt-6 border-t border-indigo-500/30 pt-4">
                        <button onClick={aprobarSeleccionados} className="bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl mb-4">✅ Aprobar Seleccionados</button>
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
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className={`xl:col-span-2 rounded-3xl border overflow-x-auto ${cardBg}`}>
                <table className="w-full text-left text-sm"><thead className="border-b"><tr><th className="p-4">Fecha</th><th className="p-4">Detalle</th><th className="p-4 text-right">Monto</th><th className="p-4 text-center"></th></tr></thead>
                  <tbody>{[...movimientosA_Mostrar].sort((a,b)=>b.id-a.id).map(mov=>(
                        <tr key={mov.id} className="border-b border-slate-200/20 hover:bg-slate-700/30">
                          <td className="p-4 text-xs text-slate-400">{mov.fecha}</td>
                          <td className="p-4 font-bold"><div className="truncate w-48">{mov.concepto}</div><span className="text-[9px] text-slate-400 uppercase">{mov.categoria} | {mov.medio_pago}</span></td>
                          <td className={`p-4 text-right font-black ${mov.tipo==='Ingreso'?colorVerde:colorRojo}`}>${fmt(mov.monto)}</td>
                          <td className="p-4 text-center"><button onClick={()=>eliminarBD('movimientos', mov.id)} className="text-rose-500">🗑️</button></td>
                        </tr>
                  ))}</tbody>
                </table>
              </div>
              <div className={`p-6 rounded-3xl border h-fit sticky top-10 ${cardBg}`}>
                <form onSubmit={guardarMovimiento} className="space-y-4">
                  <div className="flex gap-2"><label className={`flex-1 p-2 border text-center font-bold text-xs rounded-xl ${nuevoMov.tipo==='Ingreso'?'bg-emerald-600 text-white border-emerald-600':''}`}><input type="radio" className="hidden" name="tipo" value="Ingreso" checked={nuevoMov.tipo==='Ingreso'} onChange={e=>setNuevoMov({...nuevoMov, tipo: 'Ingreso', categoria:''})}/>+ Ingreso</label><label className={`flex-1 p-2 border text-center font-bold text-xs rounded-xl ${nuevoMov.tipo==='Gasto'?'bg-rose-600 text-white border-rose-600':''}`}><input type="radio" className="hidden" name="tipo" value="Gasto" checked={nuevoMov.tipo==='Gasto'} onChange={e=>setNuevoMov({...nuevoMov, tipo: 'Gasto', categoria:''})}/>- Gasto</label></div>
                  <select required className={`w-full p-2.5 rounded-lg text-sm ${inputBg}`} value={nuevoMov.categoria} onChange={e=>setNuevoMov({...nuevoMov, categoria: e.target.value})}><option value="">Clasificación</option>{nuevoMov.tipo==='Ingreso'?CAT_INGRESOS.map(c=><option key={c} value={c}>{c}</option>):CAT_GASTOS.map(c=><option key={c} value={c}>{c}</option>)}</select>
                  <input required placeholder="Descripción" className={`w-full p-2.5 rounded-lg text-sm ${inputBg}`} value={nuevoMov.concepto} onChange={e=>setNuevoMov({...nuevoMov, concepto: e.target.value})}/>
                  <select required className={`w-full p-2.5 rounded-lg text-sm ${inputBg}`} value={nuevoMov.medio_pago} onChange={e=>setNuevoMov({...nuevoMov, medio_pago: e.target.value})}><option value="">Método Pago</option>{METODOS_PAGO.map(m=><option key={m} value={m}>{m}</option>)}</select>
                  <input required type="number" placeholder="Monto" className={`w-full p-2.5 rounded-lg font-black ${inputBg}`} value={nuevoMov.monto} onChange={e=>setNuevoMov({...nuevoMov, monto: e.target.value})}/>
                  <button className={`w-full text-white p-3 rounded-xl font-bold ${nuevoMov.tipo==='Ingreso'?'bg-emerald-600':'bg-rose-600'}`}>Registrar</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() { return ( <ErrorBoundary><MainApp /></ErrorBoundary> ); }