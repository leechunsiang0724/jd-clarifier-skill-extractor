import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// Initialize PDF.js worker
// We use unpkg CDN for the worker to avoid complex build configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

export async function parsePdf(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ')
            fullText += pageText + '\n\n'
        }

        return fullText.trim()
    } catch (error) {
        console.error('Error parsing PDF:', error)
        throw new Error('Failed to parse PDF file')
    }
}

export async function parseDocx(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        return result.value.trim()
    } catch (error) {
        console.error('Error parsing DOCX:', error)
        throw new Error('Failed to parse DOCX file')
    }
}

export async function parseFile(file: File): Promise<string> {
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return parsePdf(file)
    } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
    ) {
        return parseDocx(file)
    } else {
        throw new Error('Unsupported file format. Please upload a PDF or DOCX file.')
    }
}
