import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, Plus, Euro, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export const CoachList: React.FC = () => {
    const { coaches } = useAppContext();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCoaches = coaches.filter(coach =>
        coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-secondary mb-1">Équipe de Coachs</h1>
                    <p className="text-text-muted">Supervisez les {coaches.length} intervenants et leurs spécialités.</p>
                </div>
                <button
                    onClick={() => navigate('/coaches/new')}
                    className="btn btn-primary shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    Nouveau Coach
                </button>
            </div>

            <div className="card p-4 flex items-center gap-3 bg-white border border-gray-100 focus-within:ring-2 ring-primary/20 transition-all">
                <Search className="text-text-muted" size={20} />
                <input
                    type="text"
                    placeholder="Chercher par nom ou spécialité (Yoga, Pilates...)"
                    className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-secondary placeholder:text-text-light"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoaches.map(coach => (
                    <motion.div
                        key={coach.id}
                        variants={item}
                        className="card group hover:-translate-y-1 transition-transform duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-secondary text-white flex items-center justify-center font-bold text-2xl shadow-lg group-hover:bg-secondary-light transition-colors">
                                {coach.name.charAt(0)}
                            </div>
                            <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                                {coach.hourlyRate} <Euro size={12} />/h
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-secondary mb-1">{coach.name}</h3>

                        <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
                            <Award size={16} className="text-accent" />
                            <span>{coach.specialties.length > 0 ? coach.specialties.join(' • ') : 'Généraliste'}</span>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => navigate(`/coaches/${coach.id}`)}
                                className="flex-1 btn btn-secondary text-sm py-2"
                            >
                                Profil
                            </button>
                            <button
                                onClick={() => navigate(`/planning?coach=${coach.id}`)}
                                className="flex-1 btn btn-primary text-sm py-2"
                            >
                                <Calendar size={16} /> Planning
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
            {filteredCoaches.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-text-muted">Aucun coach trouvé.</p>
                </div>
            )}
        </motion.div>
    );
};
