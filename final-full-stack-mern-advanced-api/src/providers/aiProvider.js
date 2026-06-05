import { env } from '~/config/environment'

const getMode = () => (env.AI_MODE || 'mock').toLowerCase()

const generateBoardAnalysis = async () => {
  if (getMode() !== 'real') return null

  throw new Error('Real AI provider is not implemented in this phase.')
}

const generateChecklistSuggestions = async () => {
  if (getMode() !== 'real') return null

  throw new Error('Real AI provider is not implemented in this phase.')
}

export const aiProvider = {
  getMode,
  generateBoardAnalysis,
  generateChecklistSuggestions
}
