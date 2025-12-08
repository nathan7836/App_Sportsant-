import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { type Coach } from '../../services/store';
import { ArrowLeft, Save } from 'lucide-react';

export const CoachForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { addCoach, updateCoach, coaches } = useAppContext();

    const [formData, setFormData] = useState<Omit<Coach, 'id'>>({
        name: '',
        specialties: [],
        hourlyRate: 0,
        documents: false
    });

    const [specialtiesInput, setSpecialtiesInput] = useState('');

    useEffect(() => {
        if (id) {
            const existing = coaches.find(c => c.id === id);
            if (existing) {
                const { id, ...data } = existing;
                setFormData(data);
                setSpecialtiesInput(data.specialties.join(', '));
            }
        }
    }, [id, coaches]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const specialties = specialtiesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

        if (id) {
            updateCoach({ id, ...formData, specialties });
        } else {
            addCoach({ ...formData, id: crypto.randomUUID(), specialties });
        }
        navigate('/coaches');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'hourlyRate' ? Number(value) : value)
        }));
    };

    return (
        <div className="animate-fadeIn max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/coaches')}
                className="flex items-center gap-2 text-text-muted hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Retour
            </button>

            <div className="card">
                <h1 className="text-2xl font-bold mb-6">{id ? 'Modifier Coach' : 'Nouveau Coach'}</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Nom Complet</label>
                        <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="Thomas Coach"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Spécialités (séparées par des virgules)</label>
                        <input
                            type="text"
                            value={specialtiesInput}
                            onChange={(e) => setSpecialtiesInput(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="Fitness, Pilates, Running"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Tarif Horaire (€)</label>
                            <input
                                required
                                type="number"
                                name="hourlyRate"
                                value={formData.hourlyRate || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="documents"
                                    checked={formData.documents}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-primary rounded ring-offset-2 focus:ring-2"
                                />
                                <span className="text-sm font-medium text-text-main">Documents Validés (Contrat/RCP)</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => navigate('/coaches')} className="btn btn-secondary">Annuler</button>
                        <button type="submit" className="btn btn-primary"><Save size={20} /> Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
