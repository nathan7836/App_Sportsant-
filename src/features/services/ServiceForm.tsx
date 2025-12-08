import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { type Service } from '../../services/store';
import { ArrowLeft, Save } from 'lucide-react';

export const ServiceForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { addService, updateService, services } = useAppContext();

    const [formData, setFormData] = useState<Omit<Service, 'id'>>({
        name: '',
        description: '',
        duration: 60,
        price: 0,
        type: 'Individual'
    });

    useEffect(() => {
        if (id) {
            const existing = services.find(s => s.id === id);
            if (existing) {
                const { id, ...data } = existing;
                setFormData(data);
            }
        }
    }, [id, services]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (id) {
            updateService({ id, ...formData });
        } else {
            addService({ ...formData, id: crypto.randomUUID() });
        }
        navigate('/services');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'duration' || name === 'price') ? Number(value) : value
        }));
    };

    return (
        <div className="animate-fadeIn max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/services')}
                className="flex items-center gap-2 text-text-muted hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Retour au catalogue
            </button>

            <div className="card">
                <h1 className="text-2xl font-bold mb-6">{id ? 'Modifier Service' : 'Nouveau Service'}</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Nom de la Prestation</label>
                        <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="Coaching Solo..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Description</label>
                        <textarea
                            required
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="Détails de la séance..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Durée (minutes)</label>
                            <input
                                required
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Prix (€)</label>
                            <input
                                required
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Type de Séance</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none bg-white"
                        >
                            <option value="Individual">Individuel</option>
                            <option value="Duo">Duo / Petit Groupe</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => navigate('/services')} className="btn btn-secondary">Annuler</button>
                        <button type="submit" className="btn btn-primary"><Save size={20} /> Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
