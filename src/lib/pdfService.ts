import jsPDF from 'jspdf'

interface JobSkills {
    mustHave: string[]
    niceToHave: string[]
}

export function generateJobDescriptionPDF(
    title: string,
    refinedText: string,
    skills: JobSkills
): void {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Helper function to add text with word wrapping
    const addText = (
        text: string,
        fontSize: number,
        fontStyle: 'normal' | 'bold' = 'normal',
        color: [number, number, number] = [0, 0, 0]
    ) => {
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', fontStyle)
        doc.setTextColor(color[0], color[1], color[2])

        const lines = doc.splitTextToSize(text, maxWidth)

        // Check if we need a new page
        if (yPosition + lines.length * fontSize * 0.35 > pageHeight - margin) {
            doc.addPage()
            yPosition = margin
        }

        doc.text(lines, margin, yPosition)
        yPosition += lines.length * fontSize * 0.35 + 5
    }

    // Add horizontal line
    const addDivider = () => {
        doc.setDrawColor(200, 200, 200)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 10
    }

    // Title
    addText(title.toUpperCase(), 18, 'bold', [63, 81, 181])
    yPosition += 5
    addDivider()

    // Refined Job Description
    addText('JOB DESCRIPTION', 14, 'bold', [0, 0, 0])
    yPosition += 3

    // Split refined text into paragraphs and add them
    const paragraphs = refinedText.split('\n\n')
    paragraphs.forEach((paragraph) => {
        if (paragraph.trim()) {
            // Check if it's a section header (all caps or starts with caps)
            const isHeader = paragraph.trim() === paragraph.trim().toUpperCase() && paragraph.length < 50
            if (isHeader) {
                yPosition += 5
                addText(paragraph.trim(), 12, 'bold', [33, 33, 33])
            } else {
                addText(paragraph.trim(), 11, 'normal', [66, 66, 66])
            }
        }
    })

    yPosition += 10
    addDivider()

    // Must Have Skills
    if (skills.mustHave.length > 0) {
        addText('REQUIRED SKILLS', 14, 'bold', [0, 0, 0])
        yPosition += 3

        skills.mustHave.forEach((skill, index) => {
            addText(`${index + 1}. ${skill}`, 11, 'normal', [66, 66, 66])
        })

        yPosition += 5
    }

    // Nice to Have Skills
    if (skills.niceToHave.length > 0) {
        // Check if we need a new page
        if (yPosition + 40 > pageHeight - margin) {
            doc.addPage()
            yPosition = margin
        }

        addText('PREFERRED SKILLS', 14, 'bold', [0, 0, 0])
        yPosition += 3

        skills.niceToHave.forEach((skill, index) => {
            addText(`${index + 1}. ${skill}`, 11, 'normal', [66, 66, 66])
        })
    }

    // Add footer with generation date
    const addFooter = () => {
        const totalPages = (doc as any).internal.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text(
                `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            )
        }
    }

    addFooter()

    // Generate filename from title
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`

    // Download the PDF
    doc.save(filename)
}
