export default function DifficultyBadge({ difficulty }) {
  const styles = {
    Easy:   { bg: 'var(--green)', text: '#fff' },
    Medium: { bg: 'var(--orange)', text: '#fff' },
    Hard:   { bg: 'var(--red)', text: '#fff' }
  }

  const { bg, text } = styles[difficulty] || { bg: 'var(--border)', text: 'var(--text-secondary)' }

  return (
    <span 
      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${bg}20`, color: bg, border: `1px solid ${bg}40` }}
    >
      {difficulty}
    </span>
  )
}
