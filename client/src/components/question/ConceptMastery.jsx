import { Layers } from 'lucide-react'

export default function ConceptMastery({ mastery }) {
  // Graceful fallback if old schema is loaded
  if (!mastery?.layer1) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
        <div className="text-center">
          <Layers size={32} className="mx-auto mb-3 opacity-30" />
          <p>Re-audit code to generate the 4-Layer Enhancement Plan.</p>
        </div>
      </div>
    )
  }

  const layers = [
    { id: 'layer1', ...mastery.layer1, color: 'var(--purple)' },
    { id: 'layer2', ...mastery.layer2, color: 'var(--orange)' },
    { id: 'layer3', ...mastery.layer3, color: 'var(--blue)' },
    { id: 'layer4', ...mastery.layer4, color: 'var(--cyan)' },
  ];

  return (
    <div className="flex flex-col gap-4 pt-0">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight">4-Layer Enhancement Plan</h3>
        <div className="flex items-center gap-2 mt-1">
          <Layers size={14} className="text-[var(--text-muted)]" />
          <h4 className="text-xs font-semibold text-[var(--text-secondary)]">Progressive learning path</h4>
        </div>
      </div>
      
      {layers.map((layer, index) => (
        <div 
          key={layer.id} 
          className="rounded-2xl p-5 bg-[var(--bg-hover)]/30 backdrop-blur-sm transition-all hover:bg-[var(--bg-hover)]"
          style={{ 
            border: `1px solid ${layer.color}30`, 
            borderLeft: `4px solid ${layer.color}`
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
               <span className="text-[10px] font-black uppercase tracking-widest block mb-0.5" style={{ color: layer.color }}>Layer {index + 1}</span>
               <h5 className="font-bold text-sm text-[var(--text-primary)]">{layer.title}</h5>
            </div>
            <span className="text-[10px] font-bold text-[var(--text-primary)] px-0 py-0.5">{layer.timeline}</span>
          </div>
          <ul className="space-y-2 ml-1">
            {(layer.tasks || []).map((task, i) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                <span className="leading-relaxed font-medium">{task}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
