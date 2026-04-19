import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

export default function PsychologyRadar({ data }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis 
            dataKey="trait" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Psychology"
            dataKey="score"
            stroke="var(--purple)"
            fill="var(--purple)"
            fillOpacity={0.3}
            animationDuration={1500}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
