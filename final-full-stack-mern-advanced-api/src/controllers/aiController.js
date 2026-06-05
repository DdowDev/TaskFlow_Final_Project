import { StatusCodes } from 'http-status-codes'
import { aiService } from '~/services/aiService'

const analyzeBoard = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { boardId } = req.params
    const result = await aiService.analyzeBoard(userId, boardId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const suggestChecklist = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { cardId } = req.params
    const result = await aiService.suggestChecklist(userId, cardId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const aiController = {
  analyzeBoard,
  suggestChecklist
}
