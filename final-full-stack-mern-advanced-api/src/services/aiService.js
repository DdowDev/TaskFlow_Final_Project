import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { boardPermissions } from '~/utils/boardPermissions'
import { aiProvider } from '~/providers/aiProvider'
import {
  buildBoardAnalysisByRules,
  buildChecklistSuggestionsByRules
} from '~/utils/aiFallbackRules'

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
      // Real AI is optional in this phase; fallback keeps the API demo-safe.
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
      // Real AI is optional in this phase; fallback keeps the API demo-safe.
    }

    return buildChecklistSuggestionsByRules({ card, mode: 'fallback' })
  } catch (error) { throw error }
}

export const aiService = {
  analyzeBoard,
  suggestChecklist
}
