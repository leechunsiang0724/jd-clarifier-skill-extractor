import { X, Plus } from 'lucide-react'
import { useState } from 'react'
import type { JobData } from '../../pages/JobEditor'

interface SkillsSidebarProps {
  jobData: JobData
  setJobData: (data: JobData | ((prev: JobData) => JobData)) => void
}

export function SkillsSidebar({ jobData, setJobData }: SkillsSidebarProps) {
  const [newSkill, setNewSkill] = useState('')
  const [skillType, setSkillType] = useState<'mustHave' | 'niceToHave'>('mustHave')

  const addSkill = () => {
    if (!newSkill.trim()) return

    setJobData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillType]: [...prev.skills[skillType], newSkill.trim()],
      },
    }))
    setNewSkill('')
  }

  const removeSkill = (skill: string, type: 'mustHave' | 'niceToHave') => {
    setJobData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].filter((s) => s !== skill),
      },
    }))
  }



  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6 h-full">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Extracted Skills</h2>

      {/* Must Haves */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Must Haves</h3>
        <div className="flex flex-wrap gap-2">
          {jobData.skills.mustHave.map((skill) => (
            <div
              key={skill}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all group"
            >
              <span>{skill}</span>
              <button
                onClick={() => removeSkill(skill, 'mustHave')}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Nice to Haves */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Nice to Haves</h3>
        <div className="flex flex-wrap gap-2">
          {jobData.skills.niceToHave.map((skill) => (
            <div
              key={skill}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-600 text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all group"
            >
              <span>{skill}</span>
              <button
                onClick={() => removeSkill(skill, 'niceToHave')}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Skill */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Add Skill</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            placeholder="e.g., Python, Leadership"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
          <div className="flex gap-2">
            <select
              value={skillType}
              onChange={(e) => setSkillType(e.target.value as 'mustHave' | 'niceToHave')}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            >
              <option value="mustHave">Must Have</option>
              <option value="niceToHave">Nice to Have</option>
            </select>
            <button
              onClick={addSkill}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
