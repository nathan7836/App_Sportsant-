import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { type Client } from '../../services/store';
import { ArrowLeft, Save } from 'lucide-react';

export const ClientForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { addClient, updateClient, clients } = useAppContext();

    const [formData, setFormData] = useState<Omit<Client, 'id'>>({
        name: '',
        email: '',
        phone: '',
        address: '',
        age: 0,
        height: 0,
        pathologies: '',
        emergencyContact: '',
        goals: ''
    });

    useEffect(() => {
        if (id) {
            const existingClient = clients.find(c => c.id === id);
            if (existingClient) {
                const { id, ...data } = existingClient;
                setFormData(data);
            }
        }
    }, [id, clients]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (id) {
            // Update
            const updatedClient: Client = {
                id,
                ...formData
            };
            updateClient(updatedClient);
        } else {
            // Create
            const newClient: Client = {
                ...formData,
                id: crypto.randomUUID()
            };
            addClient(newClient);
        }
        navigate('/clients');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'age' || name === 'height') ? Number(value) : value
        }));
    };

    return (
        <div className="animate-fadeIn max-w-3xl mx-auto">
            <button
                onClick={() => navigate('/clients')}
                className="flex items-center gap-2 text-text-muted hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Retour à la liste
            </button>

            <div className="card">
                <h1 className="text-2xl font-bold mb-6">{id ? 'Modifier Client' : 'Nouveau Client'}</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section: Infos Base */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold border-b pb-2">Informations Générales</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Nom Complet</label>
                                <input
                                    required
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Adresse</label>
                                <input
                                    required
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                                    placeholder="123 Rue de la Forme"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Téléphone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Âge</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Santé */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold border-b pb-2">Santé & Sécurité</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Taille (cm)</label>
                                <input
                                    type="number"
                                    name="height"
                                    value={formData.height || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Contact Urgence</label>
                                <input
                                    type="text"
                                    name="emergencyContact"
                                    value={formData.emergencyContact}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                                    placeholder="Nom: 06..."
                                />
                            </div>
                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-text-muted mb-1">Pathologies / Antécédents</label>
                                <textarea
                                    name="pathologies"
                                    value={formData.pathologies}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                                    placeholder="Allergies, douleurs chroniques..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Suivi */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold border-b pb-2">Suivi & Objectifs</h2>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Objectifs</label>
                            <textarea
                                name="goals"
                                value={formData.goals}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                                placeholder="Perte de poids, prise de masse..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/clients')}
                            className="btn btn-secondary"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            <Save size={20} />
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
