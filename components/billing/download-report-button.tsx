'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface DownloadReportButtonProps {
    revenue: number
    expense: number
    profit: number
    clientData: any[]
}

export function DownloadReportButton({ revenue, expense, profit, clientData }: DownloadReportButtonProps) {
    const generatePDF = () => {
        const doc = new jsPDF()

        // Title
        doc.setFontSize(22)
        doc.setTextColor(40, 40, 40)
        doc.text("Rapport Financier - SportSanté", 20, 20)

        // Date
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 28)

        // High Level Metrics
        doc.setFillColor(245, 247, 250)
        doc.rect(20, 35, 170, 30, 'F')

        doc.setFontSize(12)
        doc.setTextColor(60, 60, 60)
        doc.text("Chiffre d'Affaires", 30, 45)
        doc.text("Dépenses Coachs", 90, 45)
        doc.text("Bénéfice Net", 150, 45)

        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(0, 0, 0)
        doc.text(`${revenue.toLocaleString()} €`, 30, 55)
        doc.text(`${expense.toLocaleString()} €`, 90, 55)
        doc.text(`${profit.toLocaleString()} €`, 150, 55)

        // Table
        doc.setFontSize(14)
        doc.setTextColor(40, 40, 40)
        doc.text("Détail par Client", 20, 80)

        const tableBody = clientData.map(row => [
            row.client.name,
            row.count,
            `${row.total} €`,
            row.status
        ])

        autoTable(doc, {
            startY: 85,
            head: [['Client', 'Séances', 'Total', 'Statut']],
            body: tableBody,
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            bodyStyles: { textColor: 50 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 85 },
        })

        // Footer
        const pageCount = (doc.internal as any).getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text(`Page ${i} / ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' })
        }

        doc.save("rapport_financier_sportsante.pdf")
    }

    return (
        <Button onClick={generatePDF} className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" /> Rapport PDF
        </Button>
    )
}
