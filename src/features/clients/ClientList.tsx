import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, Plus, User, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const ClientList: React.FC = () => {
    const { clients } = useAppContext();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-2xl font-bold text-secondary mb-1">Portefeuille Clients</h1>
                    <p className="text-text-muted">Gérez les profils et le suivi de vos {clients.length} clients.</p>
                </div>
                <button
                    onClick={() => navigate('/clients/new')}
                    className="btn btn-primary shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    Nouveau Client
                </button>
            </div>

            <div className="card p-4 flex items-center gap-3 bg-white border border-gray-100 focus-within:ring-2 ring-primary/20 transition-all">
                <Search className="text-text-muted" size={20} />
                <input
                    type="text"
                    placeholder="Rechercher par nom, email..."
                    className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-secondary placeholder:text-text-light"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <motion.div
                        key={client.id}
                        variants={item}
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="card group cursor-pointer hover:border-primary/50 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="text-primary" size={20} />
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                                {client.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-secondary leading-tight group-hover:text-primary transition-colors">
                                    {client.name}
                                </h3>
                                <span className="text-xs font-medium text-text-muted bg-gray-100 px-2 py-0.5 rounded-full">
                                    {client.age} ans
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                <MapPin size={14} className="text-primary/70" />
                                <span className="truncate">{client.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                <User size={14} className="text-primary/70" />
                                <span>{client.height} cm • Objectif: {client.goals.substring(0, 20)}...</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {filteredClients.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                        <Search size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-secondary mb-1">Aucun résultat</h3>
                    <p className="text-text-muted">Essayez d'autres termes de recherche ou ajoutez un client.</p>
                </div>
            )}
        </motion.div>
    );
};
