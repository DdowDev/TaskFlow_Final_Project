import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { boardPermissions } from '~/utils/boardPermissions'
import { aiProvider } from '~/providers/aiProvider'
import { env } from '~/config/environment'
import {
  buildBoardAnalysisByRules,
  buildChecklistSuggestionsByRules
} from '~/utils/aiFallbackRules'

const isDevMode = () => env.BUILD_MODE === 'dev' || process.env.NODE_ENV === 'development'

const getAiErrorInfo = (error) => ({
  name: error?.name || 'Error',
  message: error?.message || 'Unknown AI provider error.',
  status: error?.status || error?.code || null
})

const logAiFallback = (scope, data) => {
  if (!isDevMode()) return

  // eslint-disable-next-line no-console
  console.log(`[AI][${scope}] fallback`, data)
}

const verifyBoardOwnerOrMember = (userId, board) => {
  if (!boardPermissions.isBoardOwnerOrMember(userId, board)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to perform this action!')
  }
}

const getBoardForAnalysis = async (userId, boardId) => {
  const board = await boardModel.getDetails(userId, boardId)
  if (!board || board._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
  }

  return board
}

const getCardBoardOrThrow = async (cardId) => {
  const card = await cardModel.findOneById(cardId)
  if (!card || card._destroy || card.isArchived === true) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
  }

  const board = await boardModel.findOneById(card.boardId)
  if (!board || board._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
  }

  return { card, board }
}

const analyzeBoard = async (userId, boardId) => {
  try {
    const board = await getBoardForAnalysis(userId, boardId)
    const dashboard = await cardModel.getBoardDashboard(boardId)
    const cards = Array.isArray(board.cards) ? board.cards : []
    const mode = aiProvider.getMode()

    if (mode === 'mock') {
      return buildBoardAnalysisByRules({ board, dashboard, cards, mode: 'mock' })
    }

    try {
      const providerResult = await aiProvider.generateBoardAnalysis({ board, dashboard, cards })
      if (providerResult) return providerResult
    } catch (error) {
      logAiFallback('BoardAnalysis', {
        boardId,
        cards: cards.length,
        mode,
        ...getAiErrorInfo(error)
      })
    }

    return buildBoardAnalysisByRules({ board, dashboard, cards, mode: 'fallback' })
  } catch (error) { throw error }
}

const suggestChecklist = async (userId, cardId) => {
  try {
    const { card, board } = await getCardBoardOrThrow(cardId)
    verifyBoardOwnerOrMember(userId, board)

    const mode = aiProvider.getMode()
    if (mode === 'mock') {
      return buildChecklistSuggestionsByRules({ card, mode: 'mock' })
    }

    try {
      const providerResult = await aiProvider.generateChecklistSuggestions({ card, board })
      if (providerResult) return providerResult
    } catch (error) {
      logAiFallback('ChecklistSuggestions', {
        cardId,
        mode,
        ...getAiErrorInfo(error)
      })
    }

    return buildChecklistSuggestionsByRules({ card, mode: 'fallback' })
  } catch (error) { throw error }
}

export const aiService = {
  analyzeBoard,
  suggestChecklist
}
