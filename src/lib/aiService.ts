// AI Service for JD refinement and skill extraction

interface RefinementOptions {
  tone: 'corporate' | 'startup' | 'academic'
  length: 'concise' | 'detailed'
}

interface RefinementResult {
  refinedText: string
  skills: {
    mustHave: string[]
    niceToHave: string[]
  }
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

export async function refineJobDescription(
  originalText: string,
  options: RefinementOptions
): Promise<RefinementResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured')
  }

  try {
    // Refinement prompt
    const refinementPrompt = `You are an expert HR content writer. Refine the following job description notes into a professional job posting.

Requirements:
- Tone: ${options.tone}
- Length: ${options.length}
- Remove gender-coded or biased language
- Use formal, professional formatting WITHOUT markdown symbols (no asterisks, no bold markers)
- Format section headers in UPPERCASE or Title Case with proper spacing (e.g., "ABOUT US" or "About Us")
- Use clear sections (About Us, Position/Role, Responsibilities, Requirements, Benefits if applicable)
- Separate sections with blank lines for readability
- Correct grammar and spelling
- Make it compelling and clear
- Use plain text formatting only - no **, no _, no markdown syntax

Original Notes:
${originalText}

Provide ONLY the refined job description text in professional plain text format, no markdown, no explanations.`

    // Call OpenAI API for refinement
    const refinementResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR content writer specializing in job descriptions.',
          },
          {
            role: 'user',
            content: refinementPrompt,
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!refinementResponse.ok) {
      const error = await refinementResponse.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const refinementData = await refinementResponse.json()
    const refinedText = refinementData.choices[0]?.message?.content || ''

    // Skill extraction prompt
    const skillsPrompt = `Analyze this job description and extract all required skills. Categorize them as:
1. Must Have: Critical, required skills (technical skills, certifications, specific experience)
2. Nice to Have: Preferred but not required skills (bonus skills, optional tools)

Job Description:
${refinedText}

Return ONLY a JSON object in this exact format with no additional text:
{
  "mustHave": ["skill1", "skill2", ...],
  "niceToHave": ["skill1", "skill2", ...]
}`

    // Call OpenAI API for skill extraction
    const skillsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing job descriptions and extracting skills. You always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: skillsPrompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!skillsResponse.ok) {
      const error = await skillsResponse.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const skillsData = await skillsResponse.json()
    const skillsContentText = skillsData.choices[0]?.message?.content || '{}'

    let skills: { mustHave: string[]; niceToHave: string[] }
    try {
      skills = JSON.parse(skillsContentText)
    } catch {
      skills = { mustHave: [], niceToHave: [] }
    }

    return {
      refinedText,
      skills,
    }
  } catch (error) {
    console.error('AI Service Error:', error)
    throw error
  }
}
