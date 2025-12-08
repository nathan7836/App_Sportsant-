import React, { createContext, useContext, useState, type ReactNode } from 'react';
import {
    initialClients, initialCoaches, initialServices, initialSessions, initialAbsences,
    type Client, type Coach, type Service, type Session, type Absence
} from '../services/store';

interface AppContextType {
    clients: Client[];
    coaches: Coach[];
    services: Service[];
    sessions: Session[];
    absences: Absence[];
    addClient: (client: Client) => void;
    updateClient: (client: Client) => void;
    deleteClient: (id: string) => void;
    addCoach: (coach: Coach) => void;
    updateCoach: (coach: Coach) => void;
    addService: (service: Service) => void;
    updateService: (service: Service) => void;
    deleteService: (id: string) => void;
    addSession: (session: Session) => void;
    updateSessionStatus: (id: string, status: Session['status']) => void;
    addAbsence: (absence: Absence) => void;
    updateAbsenceStatus: (id: string, status: Absence['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [coaches, setCoaches] = useState<Coach[]>(initialCoaches);
    const [services, setServices] = useState<Service[]>(initialServices);
    const [sessions, setSessions] = useState<Session[]>(initialSessions);
    const [absences, setAbsences] = useState<Absence[]>(initialAbsences);

    const addClient = (client: Client) => {
        setClients([...clients, client]);
    };

    const updateClient = (updatedClient: Client) => {
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
    };

    const deleteClient = (id: string) => {
        setClients(clients.filter(c => c.id !== id));
    };

    const addCoach = (coach: Coach) => {
        setCoaches([...coaches, coach]);
    };

    const updateCoach = (updatedCoach: Coach) => {
        setCoaches(coaches.map(c => c.id === updatedCoach.id ? updatedCoach : c));
    };

    const addService = (service: Service) => {
        setServices([...services, service]);
    };

    const updateService = (updatedService: Service) => {
        setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
    };

    const deleteService = (id: string) => {
        setServices(services.filter(s => s.id !== id));
    };

    const addSession = (session: Session) => {
        setSessions([...sessions, session]);
    };

    const updateSessionStatus = (id: string, status: Session['status']) => {
        setSessions(sessions.map(s => s.id === id ? { ...s, status } : s));
    };

    const addAbsence = (absence: Absence) => {
        setAbsences([...absences, absence]);
    };

    const updateAbsenceStatus = (id: string, status: Absence['status']) => {
        setAbsences(absences.map(a => a.id === id ? { ...a, status } : a));
    };

    return (
        <AppContext.Provider value={{
            clients, coaches, services, sessions, absences,
            addClient, updateClient, deleteClient,
            addCoach, updateCoach,
            addService, updateService, deleteService,
            addSession, updateSessionStatus,
            addAbsence, updateAbsenceStatus
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
