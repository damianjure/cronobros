import React, { useState } from 'react';
import {
  FileText,
  Phone,
  Calendar,
  Building,
  Fuel,
  Clock,
  Navigation,
  ArrowUpRight,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useToastStore } from '../store/toastStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatCurrency } from '../utils/currency';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function LogisticsView() {
  const itinerary = useTripStore(state => state.itinerary);
  // PR5: sourced from the trip's real (Firestore-backed) logistics doc
  // instead of `data.ts`'s Iceland fixture — a brand-new trip genuinely has
  // no drivers and no vehicle assigned yet.
  const logistics = useTripStore(state => state.logistics);
  const drivers = logistics.drivers;
  const activeVehicle = logistics.vehicle;
  const showToast = useToastStore(state => state.showToast);
  const currency = useSettingsStore(state => state.currency);
  const [fuelBudgetUsed, setFuelBudgetUsed] = useState(420);
  const [fuelLimit] = useState(650);
  const [transactions, setTransactions] = useState([
    { location: 'Selfoss N1', amount: 84.20, time: 'Ayer' },
    { location: 'Reykjavik Shell', amount: 95.50, time: '12 Ago' }
  ]);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addLoc, setAddLoc] = useState('');
  const [showDocModal, setShowDocModal] = useState<string | null>(null);

  const [chartMetric, setChartMetric] = useState<'fuel' | 'cost'>('fuel');

  // Dynamic chart data representing 6 sequential days of expedition
  // Values scale automatically as activities are added, simulating realistic fuel and daily spend
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const dayIndex = i;
    const dayNumber = dayIndex + 1;
    const itineraryDay = itinerary[dayIndex];
    const activityCount = itineraryDay ? itineraryDay.activities.length : 0;
    
    const dayLabel = itineraryDay ? `Día ${dayNumber} (${itineraryDay.date})` : `Día ${dayNumber} (Proy.)`;
    
    // Distances are influenced by the number of activities on that day
    const baseProjectedDistance = 90 + dayIndex * 20; // km base
    const activityProjectedDistance = activityCount * 30; // km
    const totalProjectedDistance = baseProjectedDistance + activityProjectedDistance;
    
    const baseRealDistance = 85 + dayIndex * 22;
    const activityRealDistance = activityCount * 35;
    const totalRealDistance = baseRealDistance + activityRealDistance;
    
    // Fuel (Liters) based on average vehicle consumption (11L/100km)
    const fuelProjected = Math.round(totalProjectedDistance * 0.11);
    const fuelReal = Math.round(totalRealDistance * 0.105);
    
    // Gasto ($ USD) per day based on activity density and fuel purchases
    const costProjected = Math.round(totalProjectedDistance * 0.35 + 40);
    const costReal = Math.round(totalRealDistance * 0.38 + (activityCount > 0 ? 45 : 15));
    
    return {
      name: dayLabel,
      'Combustible Proyectado': fuelProjected,
      'Combustible Real': fuelReal,
      'Gasto Proyectado': costProjected,
      'Gasto Real': costReal,
      activities: activityCount,
      distance: totalRealDistance
    };
  });

  const totalProjFuel = chartData.reduce((acc, curr) => acc + curr['Combustible Proyectado'], 0);
  const totalRealFuel = chartData.reduce((acc, curr) => acc + curr['Combustible Real'], 0);
  const totalProjCost = chartData.reduce((acc, curr) => acc + curr['Gasto Proyectado'], 0);
  const totalRealCost = chartData.reduce((acc, curr) => acc + curr['Gasto Real'], 0);

  const fuelDiff = totalProjFuel - totalRealFuel;
  const costDiff = totalProjCost - totalRealCost;

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

  if (!activeVehicle && drivers.length === 0) {
    return (
      <div className="space-y-10">
        <header className="border-b border-brand-primary/10 pb-6">
          <h1 className="font-serif text-3xl md:text-4xl font-black italic text-brand-primary tracking-tight">
            Logística de Transporte
          </h1>
          <p className="text-xs uppercase tracking-widest font-bold text-brand-on-surface-variant/75 mt-1.5">
            Datos reales del viaje
          </p>
        </header>
        <section className="bg-white rounded-none p-10 border border-brand-primary/10 text-center">
          <p className="font-serif font-bold italic text-brand-primary text-base mb-2">Todavía no hay logística cargada</p>
          <p className="text-xs text-brand-outline max-w-md mx-auto">
            Cuando se asignen un vehículo o conductores, sus datos aparecerán en esta sección.
          </p>
        </section>
      </div>
    );
  }

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
          {activeVehicle ? (
            <section className="bg-white rounded-none overflow-hidden border border-brand-primary/10 shadow-none grid grid-cols-1 md:grid-cols-2 group">
              <div className="relative h-64 md:h-auto overflow-hidden bg-brand-background">
                {activeVehicle.image && (
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-101"
                    src={activeVehicle.image}
                    alt={activeVehicle.name}
                  />
                )}
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
          ) : (
            <section className="bg-white rounded-none p-8 border border-brand-primary/10 shadow-none text-center">
              <p className="font-serif font-bold italic text-brand-primary text-sm mb-1">Aún no hay vehículo asignado</p>
              <p className="text-xs text-brand-outline">Cuando se asigne un vehículo a este viaje, aparecerá aquí.</p>
            </section>
          )}

          {/* Analysis Chart Card */}
          <section className="bg-white rounded-none p-6 md:p-8 border border-brand-primary/10 shadow-none space-y-6 animate-in fade-in duration-300" id="logistics-analytics-chart">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-primary/10 pb-4">
              <div>
                <h3 className="font-serif font-black italic text-brand-primary text-lg md:text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-sunset" />
                  <span>Análisis de Consumo y Gastos</span>
                </h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-outline mt-1">
                  Métricas dinámicas basadas en {itinerary.length} días de expedición y {itinerary.reduce((acc, d) => acc + d.activities.length, 0)} actividades
                </p>
              </div>

              {/* Metric Toggle Tabs */}
              <div className="flex bg-brand-background p-1 border border-brand-primary/10 select-none self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setChartMetric('fuel')}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    chartMetric === 'fuel'
                      ? 'bg-brand-primary text-white'
                      : 'text-brand-primary hover:bg-brand-primary/5'
                  }`}
                >
                  Combustible (L)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('cost')}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    chartMetric === 'cost'
                      ? 'bg-brand-primary text-white'
                      : 'text-brand-primary hover:bg-brand-primary/5'
                  }`}
                >
                  Gastos Diarios ($)
                </button>
              </div>
            </div>

            {/* Top Insight stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-brand-background p-4 border border-brand-primary/10">
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-outline block">Total Proyectado</span>
                <span className="text-lg font-serif font-black italic text-brand-primary block">
                  {chartMetric === 'fuel' ? `${totalProjFuel} Litros` : formatCurrency(totalProjCost, currency)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-outline block">Total Real (Simulado)</span>
                <span className="text-lg font-serif font-black italic text-brand-primary block">
                  {chartMetric === 'fuel' ? `${totalRealFuel} Litros` : formatCurrency(totalRealCost, currency)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-outline block">Diferencia de Ruta</span>
                <div className="flex items-center gap-1">
                  {chartMetric === 'fuel' ? (
                    fuelDiff >= 0 ? (
                      <>
                        <TrendingDown className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs font-bold text-emerald-700">-{Math.abs(fuelDiff)} L (Ahorro)</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 text-red-700 shrink-0" />
                        <span className="text-xs font-bold text-red-700">+{Math.abs(fuelDiff)} L (Exceso)</span>
                      </>
                    )
                  ) : (
                    costDiff >= 0 ? (
                      <>
                        <TrendingDown className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs font-bold text-emerald-700">-{formatCurrency(Math.abs(costDiff), currency)} (Bajo Pres.)</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 text-red-700 shrink-0" />
                        <span className="text-xs font-bold text-red-700">+{formatCurrency(Math.abs(costDiff), currency)} (Sobre Pres.)</span>
                      </>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Recharts chart render area */}
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMetric === 'fuel' ? (
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9753F" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#C9753F" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.06)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#777777" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={{ stroke: 'rgba(26,26,26,0.1)' }}
                    />
                    <YAxis 
                      stroke="#777777" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={{ stroke: 'rgba(26,26,26,0.1)' }}
                      unit=" L"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderColor: 'rgba(26,26,26,0.1)', 
                        fontFamily: 'monospace', 
                        fontSize: '10px', 
                        borderRadius: '0',
                        boxShadow: 'none'
                      }} 
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="plainline"
                      iconSize={12}
                      wrapperStyle={{ 
                        fontSize: '9px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em', 
                        fontWeight: 'bold',
                        color: '#1A1A1A'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      name="Combustible Proyectado" 
                      dataKey="Combustible Proyectado" 
                      stroke="#1A1A1A" 
                      strokeWidth={1.5}
                      fillOpacity={1} 
                      fill="url(#colorProj)" 
                    />
                    <Area 
                      type="monotone" 
                      name="Combustible Real" 
                      dataKey="Combustible Real" 
                      stroke="#C9753F" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorReal)" 
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.06)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#777777" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={{ stroke: 'rgba(26,26,26,0.1)' }}
                    />
                    <YAxis 
                      stroke="#777777" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={{ stroke: 'rgba(26,26,26,0.1)' }}
                      unit=" $"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderColor: 'rgba(26,26,26,0.1)', 
                        fontFamily: 'monospace', 
                        fontSize: '10px', 
                        borderRadius: '0',
                        boxShadow: 'none'
                      }} 
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconSize={10}
                      wrapperStyle={{ 
                        fontSize: '9px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em', 
                        fontWeight: 'bold',
                        color: '#1A1A1A'
                      }} 
                    />
                    <Bar 
                      name="Gasto Proyectado" 
                      dataKey="Gasto Proyectado" 
                      fill="#1A1A1A" 
                      opacity={0.35}
                      radius={[0, 0, 0, 0]} 
                    />
                    <Bar 
                      name="Gasto Real" 
                      dataKey="Gasto Real" 
                      fill="#C9753F" 
                      radius={[0, 0, 0, 0]} 
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Reactive Insight Info Alert */}
            <div className="flex gap-2.5 bg-brand-sunset/5 border-l-4 border-brand-sunset p-3">
              <Info className="w-4 h-4 text-brand-sunset shrink-0 mt-0.5" />
              <p className="text-[10px] text-brand-primary leading-normal font-sans font-medium">
                💡 <strong>Análisis Reactivo Activo:</strong> Al añadir o modificar paradas e itinerarios en la pestaña <strong>Planificador</strong> o aprobar lugares de la lista de propuestas, las distancias y los consumos diarios de combustible y gastos se recalcularán automáticamente en esta gráfica en tiempo real.
              </p>
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
            
            {drivers.length === 0 ? (
              <p className="text-xs text-brand-outline">Todavía no hay conductores asignados a este viaje.</p>
            ) : (
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
            )}
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
              onClick={() => showToast('Simulando el lanzamiento de las coordenadas de navegación de Google Maps: Aeropuerto de KEF - Zona B-4, Nordic Nomad Rentals.')}
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
                onClick={() => showToast('Contrato PDF simulado descargado.')}
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
