import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { userModel } from '~/models/userModel'

const userIdParam = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateUserStatus = async (req, res, next) => {
  const paramCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  const bodyCondition = Joi.object({
    isBlocked: Joi.boolean().required(),
    blockedReason: Joi.string().trim().max(255).allow('', null).default(null)
  })

  try {
    await paramCondition.validateAsync(req.params, { abortEarly: false })
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateUserRole = async (req, res, next) => {
  const paramCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  const bodyCondition = Joi.object({
    role: Joi.string().required().valid(
      userModel.USER_ROLES.USER,
      userModel.USER_ROLES.SYSTEM_ADMIN
    )
  })

  try {
    await paramCondition.validateAsync(req.params, { abortEarly: false })
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const adminValidation = {
  userIdParam,
  updateUserStatus,
  updateUserRole
}
