import { type CSSProperties } from 'react';
import { X } from 'lucide-react';

export default function HelpPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  const sections = [
    ['Empezar', 'Creá o elegí un viaje. Invitá personas desde el panel lateral y asignales permisos.'],
    ['Itinerario', 'Agregá actividades manualmente o importá texto, PDF e imágenes. Revisá siempre la vista previa antes de guardar.'],
    ['Mapa', 'Hacé clic para guardar puntos y seleccioná paradas para calcular una ruta.'],
    ['Logística', 'Consultá vehículo y conductores cargados. Los resúmenes se pueden imprimir o guardar como PDF.'],
    ['Permisos', 'Owners y editors pueden modificar. Viewers tienen acceso de lectura.'],
  ];
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-primary/40 p-4 backdrop-blur-sm">
    <md-elevated-card style={{ display: 'block' } as CSSProperties} className="max-h-[90vh] w-full max-w-xl overflow-y-auto p-6">
      <div className="mb-5 flex items-center justify-between border-b border-brand-primary/10 pb-3">
        <h2 className="font-serif text-xl font-black italic text-brand-primary">Ayuda de Cronobros</h2>
        <md-icon-button onClick={onClose} aria-label="Cerrar ayuda"><X className="h-5 w-5" /></md-icon-button>
      </div>
      <div className="space-y-4">{sections.map(([title, body]) => <section key={title}><h3 className="text-xs font-black uppercase tracking-wider text-brand-primary">{title}</h3><p className="mt-1 text-xs leading-relaxed text-brand-on-surface-variant">{body}</p></section>)}</div>
    </md-elevated-card>
  </div>;
}
