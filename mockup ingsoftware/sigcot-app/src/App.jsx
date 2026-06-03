import React, { useState, useEffect } from 'react';
import { 
  Bus, Users, Map as MapIcon, AlertCircle, LayoutDashboard, Bell, 
  Plus, Clock, Route, ParkingCircle, BarChart3, Settings, 
  Landmark, FileText, X, ShieldAlert, Zap, Radio, Save, Database, 
  CheckCircle2, HardDrive, Download, Filter, ExternalLink, ZapOff, 
  FileSpreadsheet, GraduationCap, Wifi, Activity, Cpu, Printer
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'leaflet/dist/leaflet.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement);

// ════════════════════════════════════════════
// ESTILOS DINÁMICOS Y ANIMACIONES (CSS-in-JS)
// ════════════════════════════════════════════
const GlobalStyles = () => (
  <style>{`
    @keyframes moveBlob {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(40px, -60px) scale(1.1); }
      66% { transform: translate(-30px, 30px) scale(0.9); }
      100% { transform: translate(0, 0) scale(1); }
    }
    .animate-blob { animation: moveBlob 12s infinite alternate ease-in-out; }
    .glass-card {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .glass-card:hover {
      background: rgba(30, 41, 59, 0.7);
      border-color: rgba(59, 130, 246, 0.3);
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.1);
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
  `}</style>
);

// ════════════════════════════════════════════
// COMPONENTES DE APOYO (UI)
// ════════════════════════════════════════════

const NavSection = ({ label, children }) => (
  <div className="mb-8 text-left">
    <p className="text-[9px] font-black text-blue-500/40 uppercase tracking-[0.4em] px-6 mb-4 italic">{label}</p>
    {children}
  </div>
);

const MenuItem = ({ active, onClick, icon: Icon, label, badge }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-5 px-6 py-4 rounded-[1.5rem] transition-all duration-500 group relative ${
    active ? 'bg-blue-600 text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] scale-105 z-10 font-bold' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-200'
  }`}>
    <Icon size={18} className={active ? 'text-white' : 'group-hover:text-blue-400'} />
    <span className="text-[11px] tracking-[0.1em] flex-1 text-left uppercase italic">{label}</span>
    {badge > 0 && <span className="bg-red-500 text-white text-[9px] px-2.5 py-1 rounded-full font-black animate-pulse shadow-lg">{badge}</span>}
  </button>
);

const StatCard = ({ label, value, icon: Icon, color, trend }) => {
  const colors = { blue: 'text-blue-400', red: 'text-red-400', emerald: 'text-emerald-400' };
  return (
    <div className="p-8 rounded-[3rem] glass-card relative overflow-hidden group hover:scale-[1.05]">
      <div className="relative z-10 text-left">
        <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 italic">{label}</p>
            {trend && <span className="bg-white/5 px-3 py-1 rounded-full text-[9px] font-black text-blue-400">{trend}</span>}
        </div>
        <p className={`text-6xl font-black italic tracking-tighter mt-4 ${colors[color]}`}>{value}</p>
      </div>
      <Icon size={110} className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 transition-all duration-1000" />
    </div>
  );
};

// ════════════════════════════════════════════
// COMPONENTE PRINCIPAL (APP)
// ════════════════════════════════════════════

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [fleet, setFleet] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [config, setConfig] = useState({ threshold: 85, server: 'http://localhost:3001' });

  const fetchData = async () => {
    try {
      const fetchJson = (url) => fetch(url).then(r => r.ok ? r.json() : []);
      const [resBuses, resAlerts, resPersonal] = await Promise.all([
        fetchJson('http://localhost:3001/api/buses'),
        fetchJson('http://localhost:3001/api/alertas'),
        fetchJson('http://localhost:3001/api/personal')
      ]);
      setFleet(resBuses);
      setAlerts(resAlerts);
      setPersonal(resPersonal);
    } catch (err) { console.error("Sync Error:", err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // EXPORTACIÓN PARA AUDITORÍA
  const exportExcel = (data, name) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  const exportPDF = (title, cols, rows, name) => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    autoTable(doc, { startY: 25, head: [cols], body: rows, theme: 'grid', headStyles: { fillColor: [0, 84, 168] } });
    doc.save(`${name}.pdf`);
  };

  const handleAttend = async (id) => {
    await fetch(`http://localhost:3001/api/alertas/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    const data = { id: e.target.bid.value, capacidad: e.target.bcap.value, parqueo: e.target.bpark.value };
    await fetch('http://localhost:3001/api/buses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchData();
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden relative">
      <GlobalStyles />
      
      {/* FONDO DINÁMICO */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[100px] animate-blob" style={{animationDelay: '4s'}}></div>
      </div>

      {/* SIDEBAR MEGA */}
      <aside className="w-72 bg-[#0B1420]/80 backdrop-blur-2xl border-r border-blue-900/20 flex flex-col shadow-2xl z-50">
        <div className="p-8">
            <img 
              src="https://raw.githubusercontent.com/JosueJerez/sigcot-assets/main/logo-sigcot.png" 
              alt="SIGCOT" 
              className="w-full h-auto drop-shadow-2xl mb-4 cursor-pointer" 
              onClick={()=>setActiveView('dashboard')}
              onError={(e) => { e.target.src = "https://via.placeholder.com/200x80/0B1420/FFFFFF?text=SIGCOT-GT"; }}
            />
            <p className="text-[8px] font-bold text-blue-500/60 uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div> Sincronización MySQL v8.0
            </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <NavSection label="Principal">
            <MenuItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={LayoutDashboard} label="Dashboard" />
            <MenuItem active={activeView === 'gps'} onClick={() => setActiveView('gps')} icon={Radio} label="Rastreo GPS" />
            <MenuItem active={activeView === 'fleet'} onClick={() => setActiveView('fleet')} icon={Bus} label="Gestión Flota" />
            <MenuItem active={activeView === 'lines'} onClick={() => setActiveView('lines')} icon={Route} label="Líneas Transmetro" />
          </NavSection>
          <NavSection label="Operaciones">
            <MenuItem active={activeView === 'personal'} onClick={() => setActiveView('personal')} icon={Users} label="Personal" />
            <MenuItem active={activeView === 'alerts'} onClick={() => setActiveView('alerts')} icon={Bell} label="Alertas" badge={alerts.length} />
            <MenuItem active={activeView === 'parking'} onClick={() => setActiveView('parking')} icon={ParkingCircle} label="Parqueos" />
          </NavSection>
          <NavSection label="Análisis">
            <MenuItem active={activeView === 'reports'} onClick={() => setActiveView('reports')} icon={BarChart3} label="Reportes / Auditoría" />
            <MenuItem active={activeView === 'config'} onClick={() => setActiveView('config')} icon={Settings} label="Configuración" />
          </NavSection>
        </nav>

        <div className="p-6 border-t border-blue-900/10 bg-[#080E16]/50 flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xs shadow-lg">JJ</div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-widest leading-none mb-1">Josué Jerez</p>
            <p className="text-[9px] text-blue-400 font-bold uppercase opacity-70 italic">Administrador</p>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        <header className="h-24 bg-[#020617]/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-12 z-40">
          <div className="flex items-center gap-8 text-left">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">{activeView}</h2>
            <div className="h-10 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-4 text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/60 px-6 py-3 rounded-full border border-white/5">
              <Clock size={16} className="text-blue-400" />
              <span className="text-white">03 JUN 2026 — 05:11 PM</span>
            </div>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">DB Online</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {activeView === 'dashboard' && <DashboardView fleet={fleet} alerts={alerts} />}
            {activeView === 'gps' && <GpsMapView fleet={fleet} />}
            {activeView === 'fleet' && <FleetView fleet={fleet} onOpenAdd={() => setIsModalOpen(true)} />}
            {activeView === 'personal' && <PersonalView personal={personal} onOpenEdu={setSelectedStaff} />}
            {activeView === 'alerts' && <AlertsView alerts={alerts} onAttend={handleAttend} />}
            {activeView === 'reports' && <ReportsView fleet={fleet} personal={personal} alerts={alerts} onExcel={exportExcel} onPDF={exportPDF} />}
            {activeView === 'config' && <ConfigView config={config} setConfig={setConfig} />}
            {activeView === 'parking' && <ParkingView fleet={fleet} />}
            {activeView === 'lines' && <LinesView />}
          </div>
        </div>
      </main>

      {/* MODAL EXPEDIENTE ACADÉMICO */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
            <div className="bg-[#0B1420] border border-blue-900/30 p-12 rounded-[4rem] w-full max-w-2xl shadow-2xl animate-in zoom-in text-left">
                <div className="flex justify-between items-start mb-10 text-left">
                    <div>
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Expediente Académico</h3>
                        <p className="text-blue-500 font-bold uppercase tracking-widest mt-2">{selectedStaff.nombre}</p>
                    </div>
                    <X className="cursor-pointer text-slate-500 hover:text-white" onClick={() => setSelectedStaff(null)} />
                </div>
                <div className="bg-slate-950/50 p-8 rounded-[2.5rem] border border-white/5 text-left">
                    <div className="flex items-center gap-4 mb-8 text-blue-500"><GraduationCap size={40} /><h4 className="text-2xl font-black uppercase italic">Formación</h4></div>
                    <div className="space-y-4">
                        {selectedStaff.estudios ? selectedStaff.estudios.split('|').map((est, i) => (
                            <div key={i} className="flex gap-4 items-start bg-white/5 p-5 rounded-2xl border-l-4 border-blue-600">
                                <CheckCircle2 size={20} className="text-blue-500 mt-1" />
                                <p className="font-bold text-slate-300 uppercase italic tracking-tighter">{est.trim()}</p>
                            </div>
                        )) : <p className="italic text-slate-500">Sin historial académico registrado.</p>}
                    </div>
                </div>
                <button onClick={() => setSelectedStaff(null)} className="w-full bg-blue-600 p-8 rounded-3xl font-black text-xl uppercase mt-10 shadow-2xl">Cerrar Expediente</button>
            </div>
        </div>
      )}

      {/* MODAL REGISTRO BUS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-6 text-left">
          <form onSubmit={handleAddBus} className="bg-[#0B1420] border border-blue-900/30 p-12 rounded-[4rem] w-full max-w-lg shadow-2xl text-left">
            <h3 className="text-4xl font-black italic uppercase text-white mb-10">Nueva Unidad</h3>
            <div className="space-y-6">
                <input name="bid" placeholder="PLACA (TR-0000)" className="w-full bg-slate-950 p-6 rounded-2xl border border-white/5 outline-none font-black text-white focus:border-blue-600 transition-all uppercase" required />
                <input name="bcap" type="number" placeholder="CAPACIDAD PAX" className="w-full bg-slate-950 p-6 rounded-2xl border border-white/5 outline-none font-black text-white focus:border-blue-600 transition-all uppercase" required />
                <select name="bpark" className="w-full bg-slate-950 p-6 rounded-2xl border border-white/5 text-white font-black uppercase"><option>Parqueo Norte</option><option>Parqueo Sur</option><option>Estación Central</option></select>
                <button type="submit" className="w-full bg-blue-600 p-8 rounded-3xl font-black text-xl uppercase mt-4">Sincronizar Maestro</button>
                <button type="button" onClick={()=>setIsModalOpen(false)} className="w-full text-xs font-bold text-slate-500 mt-4 uppercase">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// VISTAS HIJAS (DASHBOARD MEJORADO)
// ════════════════════════════════════════════

function DashboardView({ fleet, alerts }) {
  const perfData = {
    labels: ['06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h'],
    datasets: [{
      label: 'Unidades Activas',
      data: [4, 12, 18, 15, 14, 22, 25, 10],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0
    }]
  };

  return (
    <div className="space-y-10 text-left">
      {/* 4 HERO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Unidades MySQL" value={fleet.length} icon={Bus} color="blue" trend="LIVE" />
        <StatCard label="Ocupación Red" value="72%" icon={Route} color="emerald" trend="Óptimo" />
        <StatCard label="Alertas" value={alerts.length} icon={ShieldAlert} color="red" trend="CRÍTICO" />
        <StatCard label="Staff Activo" value="45" icon={Users} color="blue" trend="TURNO A" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* GRÁFICA DE RENDIMIENTO */}
        <div className="lg:col-span-2 glass-card rounded-[3.5rem] p-12 h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Rendimiento Operativo (24H - Sincronizado)</h3>
                <span className="bg-blue-500/10 px-4 py-1 rounded-full text-[9px] font-black text-blue-500 border border-blue-500/20 uppercase tracking-widest animate-pulse">Streaming Activo</span>
            </div>
            <div className="flex-1 w-full"><Line data={perfData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { display: false } } }} /></div>
        </div>

        {/* INTEGRIDAD DE NODOS (SYSTEM HEALTH) */}
        <div className="flex flex-col gap-6">
            <div className="glass-card rounded-[3rem] p-10 flex-1">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Integridad de Nodos</h3>
                <div className="space-y-5">
                    <HealthNode label="Maestro MySQL" status="Optimal" latency="12ms" icon={Database} />
                    <HealthNode label="GPS Gateway" status="Stable" latency="45ms" icon={Radio} />
                    <HealthNode label="Audit Log Server" status="Optimal" latency="8ms" icon={HardDrive} />
                    <HealthNode label="Frontend Node" status="Stable" latency="-" icon={Cpu} />
                </div>
            </div>
            
            {/* ACCIONES RÁPIDAS */}
            <div className="grid grid-cols-2 gap-4">
                <QuickAction icon={Printer} label="Print Report" color="bg-slate-800" />
                <QuickAction icon={Plus} label="Fast Alert" color="bg-red-900/40 border-red-500/30" />
            </div>
        </div>
      </div>
    </div>
  );
}

// COMPONENTES MINI PARA EL DASHBOARD
const HealthNode = ({ label, status, latency, icon: Icon }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-xl"><Icon size={14} className="text-blue-500" /></div>
            <span className="text-[10px] font-black uppercase text-slate-300 tracking-tighter">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[8px] font-mono text-slate-600 uppercase">{latency}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
        </div>
    </div>
);

const QuickAction = ({ icon: Icon, label, color }) => (
    <button className={`${color} border border-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:scale-105 transition-all group active:scale-95 shadow-xl`}>
        <Icon size={20} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">{label}</span>
    </button>
);

// ════════════════════════════════════════════
// RESTO DE VISTAS (LÍNEAS, GPS, PERSONAL, ETC)
// ════════════════════════════════════════════

function GpsMapView({ fleet }) {
  return (
    <div className="h-[750px] w-full rounded-[4.5rem] overflow-hidden border border-blue-900/30 shadow-2xl animate-in zoom-in duration-1000">
      <MapContainer center={[14.6349, -90.5069]} zoom={13} style={{ height: "100%", width: "100%", background: "#010409" }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {fleet.map((bus) => (
            <CircleMarker key={bus.id} center={[parseFloat(bus.lat), parseFloat(bus.lng)]} radius={16} pathOptions={{ color: bus.ocupacion > 80 ? '#ef4444' : '#3b82f6', fillColor: bus.ocupacion > 80 ? '#ef4444' : '#3b82f6', fillOpacity: 1, weight: 5 }}>
              <Popup><div className="p-2 font-black text-slate-900 text-xl italic uppercase">{bus.id} - {bus.ocupacion}%</div></Popup>
            </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

function FleetView({ fleet, onOpenAdd }) {
    return (
        <div className="glass-card rounded-[4.5rem] p-16 shadow-2xl text-left">
            <div className="flex justify-between items-end mb-16">
                <div><h3 className="text-5xl font-black italic tracking-tighter uppercase text-white mb-4">Inventario MySQL</h3><p className="text-sm text-slate-500 font-bold uppercase tracking-[0.4em] opacity-60 italic">Control RF-07</p></div>
                <button onClick={onOpenAdd} className="bg-blue-600 p-8 rounded-[2rem] font-black italic uppercase"><Plus size={32} /></button>
            </div>
            <table className="w-full text-left border-separate border-spacing-y-6">
                <thead><tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] px-10 italic"><th>Unidad</th><th>Capacidad</th><th>Monitor Carga</th><th className="text-right">Terminal</th></tr></thead>
                <tbody>{fleet.map(b => (
                    <tr key={b.id} className="bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-[2.5rem]"><td className="py-12 px-8 font-black italic text-5xl text-blue-400 tracking-tighter">{b.id}</td><td className="py-12 px-8 font-black text-2xl uppercase italic text-slate-500">{b.capacidad} PAX</td><td className="py-12 px-8"><div className="h-4 bg-slate-950 rounded-full border-2 border-white/5 overflow-hidden shadow-inner"><div className="h-full bg-blue-600" style={{width: `${b.ocupacion}%`}}></div></div></td><td className="py-12 px-8 text-right font-black uppercase text-slate-500 text-sm italic">{b.parqueo}</td></tr>
                ))}</tbody>
            </table>
        </div>
    );
}

function PersonalView({ personal, onOpenEdu }) {
    const PersonalTable = ({ title, data, icon: Icon }) => (
        <div className="glass-card rounded-[3.5rem] p-12 mb-10 shadow-2xl text-left animate-in fade-in">
            <div className="flex items-center gap-4 mb-10"><Icon size={24} className="text-blue-500" /><h3 className="text-2xl font-black italic uppercase tracking-widest text-white">{title}</h3></div>
            <table className="w-full text-left">
                <thead><tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] border-b-2 border-white/5 pb-8"><th>Identidad</th><th>Registro</th><th>Asignación</th><th className="text-center">Auditoría</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                    {data.map(p => (
                        <tr key={p.id} className="group hover:bg-white/5 transition-all"><td className="py-8 px-6 text-left"><p className="text-2xl font-black italic uppercase text-white leading-none mb-1 group-hover:text-blue-400">{p.nombre}</p><span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{p.rol}</span></td><td className="py-8 px-6 font-mono text-[11px] text-slate-500">{p.dpi}</td><td className="py-8 px-6 font-black italic uppercase opacity-60 text-white">{p.asignacion}</td><td className="py-8 px-6 text-center"><button onClick={()=>onOpenEdu(p)} className="p-4 bg-blue-600 rounded-2xl hover:scale-110 shadow-lg text-white transition-all"><GraduationCap size={20}/></button></td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    return (
        <div className="space-y-6">
            <PersonalTable title="Pilotos Operativos (RF-12)" data={personal.filter(p=>p.rol.includes('Piloto'))} icon={Bus} />
            <PersonalTable title="Seguridad y Control (RF-13)" data={personal.filter(p=>p.rol.includes('Guardia'))} icon={ShieldAlert} />
        </div>
    );
}

function AlertsView({ alerts, onAttend }) {
    return (
        <div className="space-y-8 text-left animate-in slide-in-from-right-10">
            <h3 className="text-6xl font-black italic tracking-tighter uppercase text-white mb-16">Alertas <span className="text-blue-600">LIVE</span></h3>
            {alerts.map(a => (
                <div key={a.id} className="p-12 rounded-[4rem] glass-card flex items-center justify-between group transition-all hover:translate-x-4 border-red-500/20">
                    <div className="flex items-center gap-12 text-left"><div className="p-8 rounded-[2.5rem] shadow-2xl bg-red-500/10 text-red-500 animate-bounce"><ShieldAlert size={64} /></div><div className="text-left"><div className="flex items-center gap-6 mb-4 font-black uppercase text-[11px] tracking-[0.4em]"><span className="text-red-500">{a.mensaje}</span><div className="w-2 h-2 rounded-full bg-white/20"></div><span className="text-slate-500 uppercase">SYNC LIVE</span></div><h4 className="text-5xl font-black italic uppercase text-white group-hover:text-blue-400">{a.unidad}</h4><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{a.descripcion}</p></div></div>
                    <button onClick={() => onAttend(a.id)} className="bg-emerald-600 p-10 rounded-[2.5rem] font-black uppercase border-b-8 border-emerald-900 active:translate-y-2 active:border-0 transition-all shadow-2xl">Atender</button>
                </div>
            ))}
        </div>
    );
}

function LinesView() {
    const lines = [
        { id: 'L12', name: 'Línea 12 — Sur', stations: 18, km: 12.5, color: 'from-blue-600 to-blue-900' },
        { id: 'L7', name: 'Línea 7 — Periférico', stations: 12, km: 15.2, color: 'from-emerald-600 to-emerald-900' },
        { id: 'L1', name: 'Línea 1 — Centro', stations: 10, km: 6.8, color: 'from-amber-600 to-amber-900' }
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            {lines.map((l, i) => (
                <div key={l.id} className={`p-12 rounded-[4rem] bg-gradient-to-br ${l.color} border border-white/10 shadow-2xl relative overflow-hidden group hover:scale-[1.03] transition-all`}>
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:rotate-12 transition-transform"><Route size={180} /></div>
                    <div className="flex justify-between items-start mb-10"><span className="text-white font-black text-4xl italic tracking-tighter">{l.id}</span></div>
                    <h3 className="text-2xl font-black italic text-white uppercase mb-8 leading-tight">{l.name}</h3>
                    <div className="flex gap-10 text-[10px] font-black text-white/60 uppercase tracking-widest"><span className="flex items-center gap-2"><MapIcon size={14} /> {l.stations} Est.</span><span className="flex items-center gap-2"><Route size={14} /> {l.km} KM</span></div>
                </div>
            ))}
        </div>
    );
}

function ReportsView({ fleet, personal, alerts, onExcel, onPDF }) {
    const chartData = { labels: ['En Ruta', 'Reserva', 'Mantenimiento'], datasets: [{ data: [fleet.length, 5, 2], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'], borderWidth: 0 }] };
    return (
        <div className="space-y-12 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="glass-card rounded-[4rem] p-16 h-[550px] flex flex-col"><h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12 italic">Distribución de Flota Real</h3><div className="flex-1 flex items-center justify-center"><Doughnut data={chartData} options={{ maintainAspectRatio: false }} /></div></div>
                <div className="glass-card rounded-[4rem] p-16 h-[550px] text-left"><h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12 italic">Auditoría RF-17</h3>
                    <div className="grid grid-cols-2 gap-8">
                        <button onClick={()=>onExcel(fleet, "FLOTA_XLSX")} className="p-10 rounded-[3rem] bg-slate-950/60 border border-white/5 hover:bg-emerald-600/10 transition-all flex flex-col items-center gap-4 hover:scale-105 shadow-xl"><FileSpreadsheet className="text-emerald-500" size={40}/><span className="font-black italic text-white text-xs uppercase">Excel Flota</span></button>
                        <button onClick={()=>onPDF("AUDITORÍA FLOTA", ["ID", "CAP", "ESTADO"], fleet.map(b=>[b.id, b.capacidad, b.estado]), "AUDIT_PDF")} className="p-10 rounded-[3rem] bg-slate-950/60 border border-white/5 hover:bg-red-600/10 transition-all flex flex-col items-center gap-4 hover:scale-105 shadow-xl"><FileText className="text-red-500" size={40}/><span className="font-black italic text-white text-xs uppercase">PDF Auditoría</span></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ConfigView({ config, setConfig }) {
    return (
      <div className="max-w-3xl glass-card rounded-[5rem] p-20 shadow-2xl backdrop-blur-md text-left">
        <div className="flex items-center gap-8 mb-16"><div className="bg-blue-600 p-6 rounded-[2rem] shadow-2xl shadow-blue-600/40"><Database size={48} /></div><h3 className="text-5xl font-black italic tracking-tighter uppercase text-white">Parámetros RF-10</h3></div>
        <div className="space-y-16">
          <div className="space-y-8 text-left"><div className="flex justify-between items-end"><label className="text-[11px] font-black text-slate-500 uppercase italic">Umbral de Saturación (%)</label><span className="text-6xl font-black italic text-blue-500">{config.threshold}%</span></div><input type="range" min="50" max="100" className="w-full accent-blue-600 bg-slate-950 h-3 rounded-full appearance-none border-2 border-white/5 cursor-pointer" value={config.threshold} onChange={(e)=>setConfig({...config, threshold: e.target.value})} /></div>
          <div className="bg-slate-950/50 p-10 rounded-[3rem] border border-white/5 space-y-6 shadow-inner text-xs font-black"><div className="flex justify-between"><span className="text-slate-600 uppercase">Primary Node Host</span><span className="text-blue-500 font-mono">{config.server}</span></div><div className="flex justify-between"><span className="text-slate-600 uppercase">Database Status</span><span className="text-emerald-500">SYNCHRONIZED (v8.0)</span></div></div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 p-10 rounded-[3rem] font-black italic text-3xl shadow-2xl transition-all uppercase border-b-[12px] border-blue-900 active:translate-y-2 active:border-0"><Save size={40} className="inline mr-4" /> Actualizar Reglas</button>
        </div>
      </div>
    );
}

function ParkingView({ fleet }) {
    const parks = [{ id: 'Norte', name: 'Norte — CENMA', cap: 25 }, { id: 'Sur', name: 'Sur — Trébol', cap: 20 }, { id: 'Central', name: 'Central — Barrios', cap: 15 }];
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left animate-in slide-in-from-bottom-10">
            {parks.map((p, i) => {
                const count = fleet.filter(b => b.parqueo.includes(p.id)).length;
                const perc = Math.min((count / p.cap) * 100, 100);
                return (
                    <div key={p.id} style={{ animationDelay: `${i * 200}ms` }} className="glass-card p-12 rounded-[4rem] relative overflow-hidden group hover:scale-105 transition-all text-left">
                        <ParkingCircle size={140} className="absolute -right-10 -bottom-10 opacity-5 text-blue-500" />
                        <h4 className="text-2xl font-black italic uppercase text-white mb-6 leading-none">{p.name}</h4>
                        <p className="text-7xl font-black italic text-white mb-6">{count}<span className="text-2xl opacity-20 italic">/{p.cap}</span></p>
                        <div className="h-4 bg-slate-950 rounded-full border-2 border-white/5 overflow-hidden"><div className={`h-full transition-all duration-1000 ${perc > 80 ? 'bg-red-500' : 'bg-blue-600'}`} style={{width: `${perc}%`}}></div></div>
                    </div>
                );
            })}
        </div>
    );
}