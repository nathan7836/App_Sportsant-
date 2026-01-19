'use client'

import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"

interface PlanningCalendarProps {
    currentDate: Date
}

export function PlanningCalendar({ currentDate }: PlanningCalendarProps) {
    const router = useRouter()

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            const formattedDate = date.toISOString().split('T')[0]
            router.push(`/planning?date=${formattedDate}`)
        }
    }

    return (
        <Calendar
            mode="single"
            className="rounded-md border-0"
            selected={currentDate}
            onSelect={handleDateSelect}
        />
    )
}
