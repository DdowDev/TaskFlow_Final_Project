import { StatusCodes } from 'http-status-codes'
import { activityLogService } from '~/services/activityLogService'

const getCardActivities = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const userId = req.jwtDecoded._id
    const result = await activityLogService.getCardActivities(userId, cardId, req.query)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const activityLogController = {
  getCardActivities
}
