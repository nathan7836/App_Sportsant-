// Manual type definitions for Prisma models
// These match the schema in prisma/schema.prisma

export interface User {
  id: string
  email: string
  password: string
  name: string | null
  image: string | null
  role: string
  createdAt: Date
  updatedAt: Date
  coachDetails?: CoachDetails | null
  sessions?: Session[]
  absences?: Absence[]
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  birthDate: Date | null
  height: number | null
  pathology: string | null
  emergencyContact: string | null
  goals: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  sessions?: Session[]
  measurements?: Measurement[]
}

export interface CoachDetails {
  id: string
  userId: string
  hourlyRate: number
  diplomes: string | null
  rcpInsurance: string | null
  skills: string | null
}

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  durationMin: number
  type: string
  isPack: boolean
  packCount: number | null
  sessions?: Session[]
}

export interface Session {
  id: string
  date: Date
  status: string
  notes: string | null
  coachId: string
  clientId: string
  serviceId: string
  createdAt: Date
  updatedAt: Date
  syncedToCalendar: boolean
  coach?: User
  client?: Client
  service?: Service
}

export interface Absence {
  id: string
  coachId: string
  startDate: Date
  endDate: Date
  reason: string | null
}

export interface Measurement {
  id: string
  clientId: string
  date: Date
  weight: number | null
  fatMass: number | null
  muscleMass: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface GlobalSettings {
  id: string
  monthlyGoal: number
}
