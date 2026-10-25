import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const chartData = [
  { month: 'Abr', value: 23100 }, { month: 'Mai', value: 23650 }, { month: 'Jun', value: 23200 },
  { month: 'Jul', value: 24800 }, { month: 'Ago', value: 25100 }, { month: 'Set', value: 26050 },
  { month: 'Out', value: 26870 }, { month: 'Nov', value: 27820 }, { month: 'Dez', value: 28450 },
]

export function DashboardChart() {
  return <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 6, bottom: 0, left: -18 }}><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#799982" stopOpacity={0.2} /><stop offset="100%" stopColor="#799982" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid stroke="#edf0eb" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#92998f', fontSize: 11 }} dy={11} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#92998f', fontSize: 10 }} tickFormatter={value => `R$ ${(value / 1000).toFixed(0)}k`} tickCount={5} /><Tooltip formatter={value => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value)), 'Patrimônio estimado']} contentStyle={{ borderRadius: 12, border: '1px solid #eaede8', boxShadow: '0 8px 24px #263a2514', fontSize: 12 }} labelStyle={{ color: '#697267', marginBottom: 4 }} /><Area type="monotone" dataKey="value" stroke="#557d62" strokeWidth={2.5} fill="url(#chartFill)" activeDot={{ r: 5, fill: '#557d62', stroke: '#fff', strokeWidth: 3 }} /></AreaChart></ResponsiveContainer>
}
