import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Edit, CalendarOff, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export const CoachDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { coaches, absences } = useAppContext();

    const coach = coaches.find(c => c.id === id);
    const coachAbsences = absences.filter(a => a.coachId === id).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    if (!coach) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-text-muted">Coach introuvable</h2>
                <button onClick={() => navigate('/coaches')} className="btn btn-secondary mt-4">Retour</button>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/coaches')}
                className="flex items-center gap-2 text-text-muted hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Retour à la liste
            </button>

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                        {coach.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-secondary mb-1">{coach.name}</h1>
                        <div className="flex flex-wrap gap-2">
                            {coach.specialties.map(spec => (
                                <span key={spec} className="px-2 py-0.5 bg-gray-100 text-text-muted text-xs rounded-full border border-gray-200">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/coaches/${coach.id}/edit`)}
                    className="btn btn-secondary"
                >
                    <Edit size={18} />
                    Modifier Profil
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info & Admin */}
                <div className="card md:col-span-1 space-y-6 h-fit">
                    <div>
                        <h3 className="font-bold text-lg border-b pb-2 mb-3">Administratif</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-text-muted text-sm">Tarif Horaire</span>
                                <span className="font-bold">{coach.hourlyRate} €/h</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-muted text-sm">Documents</span>
                                {coach.documents ? (
                                    <span className="flex items-center gap-1 text-success font-medium text-sm">
                                        <CheckCircle size={16} /> Validés
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-danger font-medium text-sm">
                                        <XCircle size={16} /> Manquants
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Absences */}
                <div className="card md:col-span-2">
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <CalendarOff size={20} className="text-warning" /> Gestion Absences
                        </h3>
                        <button
                            onClick={() => navigate(`/coaches/${coach.id}/absences/new`)}
                            className="btn btn-primary text-sm py-1 px-3"
                        >
                            + Déclarer
                        </button>
                    </div>

                    {coachAbsences.length === 0 ? (
                        <p className="text-text-muted text-center py-6 bg-gray-50 rounded-lg">Aucune absence déclarée.</p>
                    ) : (
                        <div className="space-y-3">
                            {coachAbsences.map(absence => (
                                <div key={absence.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-sm">
                                            {format(new Date(absence.startDate), 'dd/MM/yyyy')} au {format(new Date(absence.endDate), 'dd/MM/yyyy')}
                                        </p>
                                        {absence.reason && <p className="text-xs text-text-muted mt-1">{absence.reason}</p>}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                     ${absence.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            absence.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {absence.status === 'Approved' ? 'Validée' : absence.status === 'Rejected' ? 'Refusée' : 'En attente'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
