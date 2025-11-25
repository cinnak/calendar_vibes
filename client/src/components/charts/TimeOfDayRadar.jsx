import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export function TimeOfDayRadar({ data }) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis
                        dataKey="name"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fill: '#94a3b8' }} />
                    <Radar
                        name="Hours"
                        dataKey="value"
                        stroke="#818CF8"
                        fill="#818CF8"
                        fillOpacity={0.6}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
