import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { CARD_ACTIVITY_ACTIONS } from '~/utils/constants'

const ACTIVITY_LOG_COLLECTION_NAME = 'activityLogs'
const ACTIVITY_LOG_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  cardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  actorId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  actorEmail: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  actorDisplayName: Joi.string().allow(null, '').default(null),
  actorAvatar: Joi.string().allow(null, '').default(null),

  action: Joi.string().required().valid(...Object.values(CARD_ACTIVITY_ACTIONS)),
  metadata: Joi.object().default({}),

  createdAt: Joi.date().timestamp('javascript').default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await ACTIVITY_LOG_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const buildCardActivityQuery = (cardId, options = {}) => {
  const query = { cardId: new ObjectId(cardId) }

  if (options.excludedActions?.length) {
    query.action = { $nin: options.excludedActions }
  }

  return query
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newActivityLog = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      cardId: new ObjectId(validData.cardId),
      actorId: new ObjectId(validData.actorId)
    }

    const createdActivityLog = await GET_DB().collection(ACTIVITY_LOG_COLLECTION_NAME).insertOne(newActivityLog)
    return createdActivityLog
  } catch (error) { throw new Error(error) }
}

const getByCardId = async (cardId, skip, limit, options = {}) => {
  try {
    const results = await GET_DB().collection(ACTIVITY_LOG_COLLECTION_NAME)
      .find(buildCardActivityQuery(cardId, options))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return results
  } catch (error) { throw new Error(error) }
}

const countByCardId = async (cardId, options = {}) => {
  try {
    const result = await GET_DB().collection(ACTIVITY_LOG_COLLECTION_NAME).countDocuments(buildCardActivityQuery(cardId, options))
    return result
  } catch (error) { throw new Error(error) }
}

export const activityLogModel = {
  ACTIVITY_LOG_COLLECTION_NAME,
  ACTIVITY_LOG_COLLECTION_SCHEMA,
  createNew,
  getByCardId,
  countByCardId
}
