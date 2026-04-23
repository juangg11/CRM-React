import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboard } from '../hooks/useDashboard';

export default function Grafica() {
    const { datos } = useDashboard();
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datos}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ventas" />
            </LineChart>
        </ResponsiveContainer>
    );
}