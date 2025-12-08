import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, Plus, ShoppingBag, Clock, Repeat, Edit, Trash2 } from 'lucide-react';

export const ServiceList: React.FC = () => {
    const { services, deleteService } = useAppContext();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
            deleteService(id);
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="mb-1">Catalogue Services</h1>
                    <p className="text-text-muted">Définissez vos prestations et tarifs.</p>
                </div>
                <button
                    onClick={() => navigate('/services/new')}
                    className="btn btn-primary"
                >
                    <Plus size={20} />
                    Nouveau Service
                </button>
            </div>

            <div className="bg-surface rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un service..."
                        className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                    <div key={service.id} className="card border border-transparent hover:border-primary/20 group relative">

                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                                <ShoppingBag size={24} />
                            </div>
                            <span className="font-bold text-lg text-primary">{service.price} €</span>
                        </div>

                        <h3 className="text-lg font-bold mb-2">{service.name}</h3>
                        <p className="text-text-muted text-sm mb-4 min-h-[40px]">{service.description}</p>

                        <div className="flex items-center gap-4 text-sm text-text-main border-t border-gray-100 pt-3">
                            <div className="flex items-center gap-1">
                                <Clock size={16} className="text-text-muted" />
                                <span>{service.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Repeat size={16} className="text-text-muted" />
                                <span>{service.type === 'Individual' ? 'Individuel' : 'Duo'}</span>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => navigate(`/services/${service.id}/edit`)}
                                className="p-2 bg-white text-primary rounded-full shadow-sm hover:bg-primary hover:text-white transition-colors border border-gray-100"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(service.id)}
                                className="p-2 bg-white text-danger rounded-full shadow-sm hover:bg-danger hover:text-white transition-colors border border-gray-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};
