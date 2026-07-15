import { useState } from 'react';
import {
  FileText,
  Phone,
  Calendar,
  Building,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';

export default function LogisticsView() {
  const logistics = useTripStore(state => state.logistics);
  const drivers = logistics.drivers;
  const activeVehicle = logistics.vehicle;
  const [showDocModal, setShowDocModal] = useState<string | null>(null);

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


        </div>

        {/* Right Column (Sidebar metrics & maps) */}
        <div className="lg:col-span-4 space-y-6">
          
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

          {activeVehicle && (
            <section className="bg-white rounded-none p-5 border border-brand-primary/10 shadow-none">
              <h3 className="font-serif font-black italic text-brand-primary text-base mb-3">Contacto del proveedor</h3>
              <p className="text-sm font-bold text-brand-primary">{activeVehicle.provider}</p>
              <p className="mt-1 text-xs text-brand-on-surface-variant">Alquiler {activeVehicle.rentalId} · {activeVehicle.dates}</p>
              <a
                href={`tel:${activeVehicle.phone.replace(/[^+\d]/g, '')}`}
                className="mt-4 w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Llamar al proveedor
              </a>
            </section>
          )}

        </div>

      </div>

      {/* Document View Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="print-document bg-white rounded-none p-6 max-w-lg w-full shadow-none border border-brand-primary/10 animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-center gap-2 text-brand-primary mb-3">
              <CheckCircle2 className="w-5 h-5 fill-current text-brand-primary" />
              <h4 className="font-serif font-black italic text-lg text-brand-primary">
                {showDocModal === 'insurance' ? 'Resumen de seguro' : 'Resumen del alquiler'}
              </h4>
            </div>

            <p className="text-xs text-brand-on-surface-variant/90 font-sans leading-relaxed mt-1 border-t border-b border-brand-primary/10 py-4 italic">
              {showDocModal === 'insurance'
                ? 'No hay una póliza adjunta. Este resumen identifica el vehículo y el proveedor para solicitar la documentación correspondiente.'
                : `${activeVehicle?.name ?? 'Vehículo'} · alquiler ${activeVehicle?.rentalId ?? 'sin ID'} · proveedor ${activeVehicle?.provider ?? 'sin proveedor'} · fechas ${activeVehicle?.dates ?? 'sin fechas'}.`
              }
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="py-2 px-4 border border-brand-primary/10 text-brand-primary rounded-none font-bold text-[10px] uppercase tracking-widest hover:bg-brand-primary/5 transition-all cursor-pointer"
              >
                Imprimir / guardar PDF
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
