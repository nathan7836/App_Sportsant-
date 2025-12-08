import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Edit, User, Phone, Mail, MapPin, Activity, HeartPulse, ShieldAlert } from 'lucide-react';

export const ClientDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { clients } = useAppContext();

    const client = clients.find(c => c.id === id);

    if (!client) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-text-muted">Client introuvable</h2>
                <button onClick={() => navigate('/clients')} className="btn btn-secondary mt-4">Retour</button>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/clients')}
                className="flex items-center gap-2 text-text-muted hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Retour à la liste
            </button>

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                        {client.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-secondary mb-1">{client.name}</h1>
                        <div className="flex items-center gap-2 text-text-muted">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-sm font-medium">{client.age} ans</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> {client.address}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/clients/${client.id}/edit`)}
                    className="btn btn-secondary"
                >
                    <Edit size={18} />
                    Modifier
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Info */}
                <div className="card md:col-span-1 space-y-4 h-fit">
                    <h3 className="font-bold text-lg border-b pb-2 mb-2 flex items-center gap-2">
                        <User size={20} className="text-primary" /> Contact
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Phone size={18} className="text-text-muted" />
                            <span className="font-medium">{client.phone || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-text-muted" />
                            <span className="break-all">{client.email || 'Non renseigné'}</span>
                        </div>
                    </div>
                </div>

                {/* Health & Specs */}
                <div className="card md:col-span-2 space-y-6">
                    <div>
                        <h3 className="font-bold text-lg border-b pb-2 mb-4 flex items-center gap-2">
                            <HeartPulse size={20} className="text-danger" /> Santé & Sécurité
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-sm text-text-muted block mb-1">Taille</span>
                                <span className="font-bold text-lg">{client.height ? `${client.height} cm` : 'Non renseigné'}</span>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="text-sm text-red-600 block mb-1 flex items-center gap-1"><ShieldAlert size={14} /> Urgence</span>
                                <span className="font-bold text-red-700">{client.emergencyContact || 'Non renseigné'}</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <span className="font-semibold block mb-2">Pathologies / Antécédents</span>
                            <p className="text-text-muted bg-gray-50 p-3 rounded-lg min-h-[80px]">
                                {client.pathologies || 'Aucune pathologie signalée.'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg border-b pb-2 mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-success" /> Suivi & Objectifs
                        </h3>
                        <p className="text-text-main leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
                            {client.goals || 'Aucun objectif défini.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
