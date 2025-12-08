import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    TrendingUp,
    Activity,
    Plus,
    ArrowRight,
    Clock,
    CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const today = new Date();

    const kpiData = [
        { label: 'Séances du jour', value: '5', icon: Calendar, color: 'text-primary', bg: 'bg-primary/10', trend: '+1 aujourd\'hui' },
        { label: 'Clients Actifs', value: '24', icon: Users, color: 'text-info', bg: 'bg-info/10', trend: '+3 ce mois' },
        { label: 'Revenu Mensuel', value: '3 240 €', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', trend: '+12% vs N-1' },
        { label: 'Taux de Présence', value: '98%', icon: Activity, color: 'text-warning', bg: 'bg-warning/10', trend: 'Stable' },
    ];

    const upcomingSessions = [
        { time: '09:00', client: 'Sophie Martin', activity: 'Coaching Solo', status: 'Confirmed' },
        { time: '10:30', client: 'Marc Dubois', activity: 'Bilan Forme', status: 'Pending' },
        { time: '14:00', client: 'Julie & Tom', activity: 'Duo Training', status: 'Confirmed' },
    ];

    // Mock Chart Data
    const revenueData = [
        { name: 'Lun', uv: 400 },
        { name: 'Mar', uv: 300 },
        { name: 'Mer', uv: 600 },
        { name: 'Jeu', uv: 450 },
        { name: 'Ven', uv: 800 },
        { name: 'Sam', uv: 950 },
        { name: 'Dim', uv: 200 },
    ];

    const pieData = [
        { name: 'Solo', value: 65 },
        { name: 'Duo', value: 25 },
        { name: 'Groupe', value: 10 },
    ];
    const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-secondary mb-1">Bonjour, Admin 👋</h1>
                    <p className="text-text-muted">
                        Voici ce qui se passe aujourd'hui, le <span className="text-text-main font-medium">{format(today, 'd MMMM yyyy', { locale: fr })}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/planning')} className="btn btn-secondary">
                        <Calendar size={18} /> Planning
                    </button>
                    <button onClick={() => navigate('/clients/new')} className="btn btn-primary">
                        <Plus size={18} /> Nouveau Client
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="card border-none hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                                <kpi.icon size={24} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-50 text-text-muted`}>
                                {kpi.trend}
                            </span>
                        </div>
                        <h3 className="text-text-muted text-sm font-medium mb-1">{kpi.label}</h3>
                        <p className="text-2xl font-bold text-secondary">{kpi.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 card p-6"
                >
                    <h2 className="text-xl font-bold mb-6">Revenus de la semaine</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="uv" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Session Type Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card p-6"
                >
                    <h2 className="text-xl font-bold mb-6">Types de Séances</h2>
                    <div className="h-[200px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="block text-2xl font-bold text-secondary">100%</span>
                            <span className="text-xs text-text-muted">Répartition</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        {pieData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="text-text-muted">{item.name}</span>
                                </div>
                                <span className="font-bold text-secondary">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom: Schedule & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Schedule */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Prochaines Séances</h2>
                        <button onClick={() => navigate('/planning')} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                            Voir tout <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="card p-0 overflow-hidden">
                        {upcomingSessions.map((session, idx) => (
                            <div key={idx} className="p-4 border-b border-gray-100 last:border-none flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/5 text-primary font-bold px-3 py-2 rounded-md text-sm min-w-[60px] text-center">
                                        {session.time}
                                    </div>
                                    <div>
                                        <p className="font-bold text-secondary">{session.client}</p>
                                        <p className="text-xs text-text-muted">{session.activity}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
                                    ${session.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {session.status === 'Confirmed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                    {session.status === 'Confirmed' ? 'Confirmé' : 'En attente'}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right: Quick Actions / Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-6"
                >
                    <h2 className="text-xl font-bold">Activité Récente</h2>
                    <div className="card space-y-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <Users size={16} />
                            </div>
                            <div>
                                <p className="text-sm text-secondary"><span className="font-bold">Nouveau client</span> ajouté</p>
                                <p className="text-xs text-text-muted">Il y a 2h • Par Admin</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                <Clock size={16} />
                            </div>
                            <div>
                                <p className="text-sm text-secondary">Séance de <span className="font-bold">14:00</span> terminée</p>
                                <p className="text-xs text-text-muted">Il y a 4h • Thomas Coach</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                <Activity size={16} />
                            </div>
                            <div>
                                <p className="text-sm text-secondary">Objectif atteint: <span className="font-bold">Sophie M.</span></p>
                                <p className="text-xs text-text-muted">Hier • Perte de poids</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg">
                        <h3 className="font-bold mb-2">Besoin d'aide ?</h3>
                        <p className="text-sm text-white/80 mb-4">Consultez la documentation ou contactez le support technique.</p>
                        <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
                            Centre d'aide
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};
