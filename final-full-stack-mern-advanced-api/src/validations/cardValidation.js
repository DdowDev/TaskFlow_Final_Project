import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { CARD_MEMBER_ACTIONS, CARD_PRIORITIES, CARD_STATUSES } from '~/utils/constants'

const checklistTitleSchema = Joi.string().trim().min(1).max(100).required()
const checklistItemTitleSchema = Joi.string().trim().min(1).max(200).required()
const checklistIdSchema = Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  // Lưu ý không dùng hàm required() trong trường hợp Update
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().optional(),
    status: Joi.string().valid(...Object.values(CARD_STATUSES)),
    priority: Joi.string().valid(...Object.values(CARD_PRIORITIES)),
    startDate: Joi.date().allow(null),
    dueDate: Joi.date().allow(null),
    isArchived: Joi.boolean().optional(),
    commentToAdd: Joi.object({
      userAvatar: Joi.string().allow(null, ''),
      userDisplayName: Joi.string().allow(null, ''),
      content: Joi.string().required().trim().strict()
    }),
    incomingMemberInfo: Joi.object({
      userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      action: Joi.string().required().valid(...Object.values(CARD_MEMBER_ACTIONS))
    }),
    checklistToAdd: Joi.object({
      title: checklistTitleSchema
    }),
    checklistToRename: Joi.object({
      checklistId: checklistIdSchema,
      title: checklistTitleSchema
    }),
    checklistToDelete: Joi.object({
      checklistId: checklistIdSchema
    }),
    checklistItemToAdd: Joi.object({
      checklistId: checklistIdSchema,
      title: checklistItemTitleSchema
    }),
    checklistItemToRename: Joi.object({
      checklistId: checklistIdSchema,
      itemId: checklistIdSchema,
      title: checklistItemTitleSchema
    }),
    checklistItemToToggle: Joi.object({
      checklistId: checklistIdSchema,
      itemId: checklistIdSchema,
      isCompleted: Joi.boolean().required()
    }),
    checklistItemToDelete: Joi.object({
      checklistId: checklistIdSchema,
      itemId: checklistIdSchema
    })
  })

  try {
    // Chỉ định abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    // Đối với trường hợp update, cho phép Unknown để không cần đẩy một số field lên
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const cardValidation = {
  createNew,
  update
}
