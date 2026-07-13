import React, { useState } from 'react';
import {
  FileText,
  Phone,
  Calendar,
  Building,
  Fuel,
  CreditCard,
  Gauge,
  Clock,
  Navigation,
  Compass,
  ArrowUpRight,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Driver } from '../types';
import { initialDrivers, activeVehicle } from '../data';

export default function LogisticsView() {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [fuelBudgetUsed, setFuelBudgetUsed] = useState(420);
  const [fuelLimit, setFuelLimit] = useState(650);
  const [transactions, setTransactions] = useState([
    { location: 'Selfoss N1', amount: 84.20, time: 'Ayer' },
    { location: 'Reykjavik Shell', amount: 95.50, time: '12 Ago' }
  ]);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addLoc, setAddLoc] = useState('');
  const [showDocModal, setShowDocModal] = useState<string | null>(null);

  const fuelSpentPercent = Math.min(100, Math.round((fuelBudgetUsed / fuelLimit) * 100));

  const handleAddFuelPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(addAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !addLoc.trim()) return;

    setFuelBudgetUsed(prev => prev + parsedAmount);
    setTransactions(prev => [
      { location: addLoc, amount: parsedAmount, time: 'Justo ahora' },
      ...prev
    ]);

    setAddAmount('');
    setAddLoc('');
    setShowAddPurchase(false);
  };

  const specifications = [
    { name: 'Transmisión', value: '4WD / Altura Elevada', note: 'Requerido para cruces de ríos en carreteras F.' },
    { name: 'Combustible', value: 'Diésel (AdBlue)', note: 'Mantener el tanque por encima del 40% en Tierras Altas.' },
    { name: 'Carga Útil', value: 'Máx 640kg', note: 'Portaequipajes de techo solo para equipo de campamento.' },
    { name: 'Neumáticos', value: 'Todo Terreno 32"', note: 'Monitorear presión diariamente en grava.' }
  ];

  return (
    <div className="space-y-10">
      
      {/* Title Header */}
      <header className="border-b border-brand-primary/10 pb-6">
        <h1 className="font-serif text-3xl md:text-4xl font-black italic text-brand-primary tracking-tight">
          Logística de Transporte
        </h1>
        <p className="text-xs uppercase tracking-widest font-bold text-brand-on-surface-variant/75 mt-1.5">
          Soporte de Expedición y Gestión de Flota
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Vehicle & specifications) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Vehicle card */}
          <section className="bg-white rounded-none overflow-hidden border border-brand-primary/10 shadow-none grid grid-cols-1 md:grid-cols-2 group">
            <div className="relative h-64 md:h-auto overflow-hidden">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-101" 
                src={activeVehicle.image} 
                alt={activeVehicle.name} 
              />
              <div className="absolute top-4 left-4">
                <span className="px-2.5 py-1 bg-brand-primary text-white text-[8px] font-black rounded-none uppercase tracking-widest shadow-none">
                  Flota Activa
                </span>
              </div>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-2xl font-black italic text-brand-primary tracking-tight">
                  {activeVehicle.name}
                </h2>
                <p className="text-[9px] font-black text-brand-outline uppercase mt-0.5 tracking-wider">
                  ID de Alquiler: {activeVehicle.rentalId}
                </p>
                
                <div className="space-y-3.5 mt-5">
                  <div className="flex items-center gap-3 text-brand-on-surface-variant font-medium text-xs">
                    <Building className="w-4 h-4 text-brand-primary/65 shrink-0" />
                    <span>{activeVehicle.provider}</span>
                  </div>
                  <div className="flex items-center gap-3 text-brand-on-surface-variant font-medium text-xs">
                    <Phone className="w-4 h-4 text-brand-primary/65 shrink-0" />
                    <span>{activeVehicle.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-brand-on-surface-variant font-medium text-xs">
                    <Calendar className="w-4 h-4 text-brand-primary/65 shrink-0" />
                    <span>{activeVehicle.dates}</span>
                  </div>
                </div>
              </div>

              {/* Document download buttons */}
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setShowDocModal('insurance')}
                  className="flex-1 p-3.5 bg-brand-background hover:bg-brand-primary/5 border border-brand-primary/10 rounded-none flex items-center justify-between group cursor-pointer transition-colors active:scale-98"
                  id="logistics-doc-insurance"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-primary/70" />
                    <span className="font-bold text-[10px] uppercase tracking-widest text-brand-primary">Póliza de Seguro</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-brand-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                
                <button 
                  onClick={() => setShowDocModal('agreement')}
                  className="flex-1 p-3.5 bg-brand-background hover:bg-brand-primary/5 border border-brand-primary/10 rounded-none flex items-center justify-between group cursor-pointer transition-colors active:scale-98"
                  id="logistics-doc-agreement"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-primary/70" />
                    <span className="font-bold text-[10px] uppercase tracking-widest text-brand-primary">Contrato</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-brand-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>
          </section>

          {/* Technical specifications */}
          <section className="bg-white rounded-none p-6 md:p-8 border border-brand-primary/10 shadow-none">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif font-black italic text-brand-primary text-base">
                Especificaciones Técnicas y Notas
              </h3>
              <MoreHorizontal className="w-5 h-5 text-brand-outline cursor-pointer" />
            </div>

            <div className="overflow-x-auto border border-brand-primary/10">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead className="bg-brand-background text-brand-primary font-black border-b border-brand-primary/10 uppercase tracking-widest">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Especificación</th>
                    <th className="px-4 py-3 font-semibold">Detalle</th>
                    <th className="px-4 py-3 font-semibold">Notas de Expedición</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-primary/5 font-medium text-brand-on-surface">
                  {specifications.map((spec) => (
                    <tr key={spec.name} className="hover:bg-brand-background transition-colors">
                      <td className="px-4 py-4 font-bold text-brand-primary">{spec.name}</td>
                      <td className="px-4 py-4">{spec.value}</td>
                      <td className="px-4 py-4 text-brand-on-surface-variant italic">{spec.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Right Column (Sidebar metrics & maps) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Fuel Budget Tracker */}
          <section className="bg-white rounded-none p-6 border border-brand-primary/10 shadow-none relative overflow-hidden" id="logistics-fuel-card">
            
            <div className="absolute -right-8 -top-8 opacity-[0.03] text-brand-primary pointer-events-none">
              <Fuel className="w-32 h-32" />
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-serif font-black italic text-brand-primary text-base flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-brand-primary/75" />
                <span>Presupuesto de Combustible</span>
              </h3>
              <button 
                onClick={() => setShowAddPurchase(!showAddPurchase)}
                className="text-[9px] uppercase tracking-widest bg-brand-primary text-white font-black px-3 py-1.5 rounded-none flex items-center gap-1 hover:bg-brand-primary/90 active:scale-95 cursor-pointer transition-all"
                id="fuel-add-purchase-toggle"
              >
                <Plus className="w-3 h-3" />
                <span>Registrar Compra</span>
              </button>
            </div>

            {/* Dynamic fuel purch form */}
            {showAddPurchase && (
              <form onSubmit={handleAddFuelPurchase} className="mb-4 p-4 bg-brand-background rounded-none border border-brand-primary/10 space-y-3 animate-in slide-in-from-top-3 duration-200">
                <h4 className="font-serif font-black italic text-xs text-brand-primary">Registrar Recarga</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] uppercase font-black text-brand-outline tracking-widest">Monto ($)</label>
                    <input 
                      type="number" 
                      placeholder="ej. 80" 
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="w-full bg-white border border-brand-primary/10 rounded-none p-2 text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase font-black text-brand-outline tracking-widest">Ubicación</label>
                    <input 
                      type="text" 
                      placeholder="ej. Vík N1" 
                      value={addLoc}
                      onChange={(e) => setAddLoc(e.target.value)}
                      className="w-full bg-white border border-brand-primary/10 rounded-none p-2 text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 bg-brand-primary text-white rounded-none font-bold text-[10px] uppercase tracking-widest shadow-none transition-all"
                >
                  Añadir Transacción
                </button>
              </form>
            )}

            <div className="flex justify-between items-end mb-2.5">
              <div>
                <span className="text-3xl font-serif font-black italic text-brand-primary">${fuelBudgetUsed.toFixed(2)}</span>
                <span className="text-brand-on-surface-variant/75 font-bold text-[11px] uppercase tracking-wider"> / ${fuelLimit.toFixed(2)}</span>
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest text-brand-primary">
                {fuelSpentPercent}% Gastado
              </span>
            </div>

            {/* Custom progressive bar */}
            <div className="w-full h-1.5 bg-brand-background rounded-none overflow-hidden mb-5">
              <div 
                className="h-full rounded-none transition-all duration-500 bg-brand-primary"
                style={{ width: `${fuelSpentPercent}%` }} 
              />
            </div>

            {/* Transactions stats */}
            <div className="space-y-3 pt-3 border-t border-brand-primary/10">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-brand-on-surface-variant">Última Recarga</span>
                <span className="text-brand-primary font-black">-${transactions[0]?.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-brand-on-surface-variant">Ubicación de Estación</span>
                <span className="text-brand-primary font-black uppercase text-[10px] tracking-wider text-right truncate max-w-[150px]">
                  {transactions[0]?.location}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-brand-on-surface-variant">Autonomía Restante (Est.)</span>
                <span className="text-brand-primary font-black">663 km</span>
              </div>
            </div>
          </section>

          {/* Driver Shift Assignments */}
          <section className="bg-white rounded-none p-6 border border-brand-primary/10 shadow-none">
            <h3 className="font-serif font-black italic text-brand-primary text-base mb-5">
              Conductores Asignados
            </h3>
            
            <div className="space-y-4">
              {drivers.map((drv) => (
                <div 
                  key={drv.id}
                  className="flex items-start gap-4 p-4 rounded-none border border-brand-primary/10 bg-brand-background"
                >
                  <div className="w-12 h-12 rounded-none overflow-hidden border border-brand-primary/10 shrink-0">
                    <img className="w-full h-full object-cover" src={drv.avatar} alt={drv.name} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-1.5 mb-1">
                      <p className="font-serif font-black italic text-brand-primary text-sm truncate">{drv.name}</p>
                      
                      <span className={`text-[8px] font-black px-2.5 py-1 rounded-none uppercase tracking-widest border border-brand-primary/10 bg-white ${
                        drv.status === 'On Shift'
                          ? 'text-brand-primary'
                          : 'text-brand-outline'
                      }`}>
                        {drv.status === 'On Shift' ? 'En Turno' : 'Libre'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-on-surface-variant/90 font-medium mb-2">{drv.role === 'Lead Navigator' ? 'Navegador Principal' : drv.role === 'Relief Driver' ? 'Conductor de Relevo' : drv.role}</p>
                    
                    <div className="flex items-center gap-1.5 text-brand-primary/60 font-black text-[9px] uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 text-brand-primary/55 shrink-0" />
                      <span>{drv.shift === 'Morning (08:00 - 14:00)' ? 'Mañana (08:00 - 14:00)' : drv.shift === 'Afternoon (14:00 - 20:00)' ? 'Tarde (14:00 - 20:00)' : drv.shift}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pick-up Location Card with Map */}
          <section className="bg-white rounded-none p-5 border border-brand-primary/10 shadow-none">
            <h3 className="font-serif font-black italic text-brand-primary text-base mb-3">
              Lugar de Recogida
            </h3>
            
            <div className="relative w-full h-44 rounded-none overflow-hidden border border-brand-primary/10 mb-4 group shadow-none">
              <img 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqNpFs4bQd7_CVMCwC4ZdXxsR7ka_xiwpEw198H3OWI8uKnNRPqbXRLxIeLfL7XlWLzK2g3S_DLlOTzFNqofatd6oy2Dnolxmp6wqRDsqIDTlxfDjvYQAzcuvtlPpBWzSXZifQqb5mIx8Abn1cXshjsgMiRfy0yxl64tO4uBdtZA2RlFdpHRj2WfgtfSb399HL4Zxe9Xj5Eo5WqlpCMLksMFC08TWXbUnXip-9msUpku2sPZrCZNTGd5xaE-eECTgGqlPBfyQnPyaI" 
                alt="Ubicación en mapa de Keflavik" 
              />
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm p-3 rounded-none shadow-none border border-brand-primary/10">
                <p className="font-serif font-black italic text-xs text-brand-primary leading-tight">Aeropuerto Internacional de Keflavík (KEF)</p>
                <p className="text-[10px] text-brand-on-surface-variant/80 font-medium mt-0.5">Terminal de Llegadas P1, Zona B-4</p>
              </div>
            </div>

            <button 
              onClick={() => alert("Simulando el lanzamiento de las coordenadas de navegación de Google Maps: Aeropuerto de KEF - Zona B-4, Nordic Nomad Rentals.")}
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-none font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-none transition-all cursor-pointer active:scale-95"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>Abrir en Navegador</span>
            </button>
          </section>

        </div>

      </div>

      {/* Document View Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-none p-6 max-w-lg w-full shadow-none border border-brand-primary/10 animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-center gap-2 text-brand-primary mb-3">
              <CheckCircle2 className="w-5 h-5 fill-current text-brand-primary" />
              <h4 className="font-serif font-black italic text-lg text-brand-primary">
                {showDocModal === 'insurance' ? 'Póliza de Seguro de Alquiler Verificada' : 'Contrato de Alquiler Activo'}
              </h4>
            </div>

            <p className="text-xs text-brand-on-surface-variant/90 font-sans leading-relaxed mt-1 border-t border-b border-brand-primary/10 py-4 italic">
              {showDocModal === 'insurance' 
                ? "Nivel de cobertura de alquiler: Oro Premium. Características: Exención total de CDW, protección contra daños por grava, protección contra arena y ceniza (SADW), cobertura sin deducible. Proporcionado por TM Tryggingar Iceland."
                : "Cuenta del inquilino: Alex Thorne (Damian Group). Conductores autorizados: Alex Thorne, Sarah Miller. Tarifa base: $125.00/día. Estado del depósito de seguridad: Verificado y preautorizado. Detalles de devolución de llaves: Buzón de la Zona B-4."
              }
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button 
                onClick={() => alert("Contrato PDF simulado descargado.")}
                className="py-2 px-4 border border-brand-primary/10 text-brand-primary rounded-none font-bold text-[10px] uppercase tracking-widest hover:bg-brand-primary/5 transition-all cursor-pointer"
              >
                Descargar PDF
              </button>
              <button 
                onClick={() => setShowDocModal(null)}
                className="py-2 px-5 bg-brand-primary text-white rounded-none font-bold text-[10px] uppercase tracking-widest hover:bg-brand-primary/90 transition-all cursor-pointer"
              >
                Cerrar Contrato
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
