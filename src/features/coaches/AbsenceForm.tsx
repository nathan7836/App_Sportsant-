import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { type Absence } from '../../services/store';
import { ArrowLeft, Save } from 'lucide-react';

export const AbsenceForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // coach id
    const { addAbsence, coaches } = useAppContext();

    const coach = coaches.find(c => c.id === id);

    const [formData, setFormData] = useState<Omit<Absence, 'id' | 'coachId' | 'status'>>({
        startDate: '',
        endDate: '',
        reason: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        const newAbsence: Absence = {
            id: crypto.randomUUID(),
            coachId: id,
            status: 'Pending',
            ...formData
        };

        addAbsence(newAbsence);
        navigate(`/coaches/${id}`);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!coach) return <div>Coach introuvable</div>;

    return (
        <div className="animate-fadeIn max-w-2xl mx-auto">
            <button
                onClick={() => navigate(`/coaches/${id}`)}
                className="flex items-center gap-2 text-text-muted hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Retour au profil
            </button>

            <div className="card">
                <h1 className="text-2xl font-bold mb-6">Déclarer une Absence</h1>
                <p className="text-text-muted mb-6">Pour {coach.name}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Date de début</label>
                            <input
                                required
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Date de fin</label>
                            <input
                                required
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Motif (Optionnel)</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="Congés, Maladie, Formation..."
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/coaches/${id}`)}
                            className="btn btn-secondary"
                        >
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={20} />
                            Déclarer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
