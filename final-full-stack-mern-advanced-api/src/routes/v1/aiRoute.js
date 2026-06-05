import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { aiValidation } from '~/validations/aiValidation'
import { aiController } from '~/controllers/aiController'

const Router = express.Router()

Router.route('/boards/:boardId/analysis')
  .post(authMiddleware.isAuthorized, aiValidation.boardIdParam, aiController.analyzeBoard)

Router.route('/cards/:cardId/checklist-suggestions')
  .post(authMiddleware.isAuthorized, aiValidation.cardIdParam, aiController.suggestChecklist)

export const aiRoute = Router
