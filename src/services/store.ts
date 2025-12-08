export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    age: number;
    height: number;
    pathologies: string;
    emergencyContact: string;
    goals: string;
}

export interface Coach {
    id: string;
    name: string;
    specialties: string[];
    hourlyRate: number;
    documents: boolean;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    duration: number; // minutes
    price: number;
    type: 'Individual' | 'Duo';
}

export interface Session {
    id: string;
    date: string; // ISO date
    coachId: string;
    clientId: string;
    serviceId: string;
    status: 'Planned' | 'Confirmed' | 'Done' | 'Cancelled';
}

export interface Absence {
    id: string;
    coachId: string;
    startDate: string;
    endDate: string;
    reason?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

// Mock Data
export const initialClients: Client[] = [
    {
        id: '1',
        name: 'Sophie Martin',
        email: 'sophie.m@example.com',
        phone: '06 12 34 56 78',
        address: '12 Rue de la Paix, Paris',
        age: 34,
        height: 165,
        pathologies: 'Douleurs lombaires',
        emergencyContact: 'Pierre: 06 98 76 54 32',
        goals: 'Perte de poids, renforcement dos'
    }
];

export const initialCoaches: Coach[] = [
    {
        id: '1',
        name: 'Thomas Coach',
        specialties: ['Fitness', 'Yoga'],
        hourlyRate: 40,
        documents: true
    }
];

export const initialServices: Service[] = [
    {
        id: '1',
        name: 'Coaching Solo',
        description: 'Séance personnalisée à domicile',
        duration: 60,
        price: 60,
        type: 'Individual'
    }
];

export const initialSessions: Session[] = [];
export const initialAbsences: Absence[] = [];
