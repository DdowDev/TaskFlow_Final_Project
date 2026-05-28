/**
 * Updated by trungquandev.com's author on Oct 8 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { CARD_MEMBER_ACTIONS, CARD_PRIORITIES, CARD_STATUSES } from '~/utils/constants'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  createdBy: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  status: Joi.string().valid(...Object.values(CARD_STATUSES)).default(CARD_STATUSES.TODO),
  priority: Joi.string().valid(...Object.values(CARD_PRIORITIES)).default(CARD_PRIORITIES.MEDIUM),
  startDate: Joi.date().timestamp('javascript').allow(null).default(null),
  dueDate: Joi.date().timestamp('javascript').allow(null).default(null),
  completedAt: Joi.date().timestamp('javascript').allow(null).default(null),
  lastActivityAt: Joi.date().timestamp('javascript').allow(null).default(null),

  cover: Joi.string().default(null),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  comments: Joi.array().items({
    _id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    commentedAt: Joi.date().timestamp()
  }).default([]),
  checklists: Joi.array().items(
    Joi.object({
      _id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      title: Joi.string().required().max(100).trim().strict(),
      items: Joi.array().items(
        Joi.object({
          _id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
          title: Joi.string().required().max(200).trim().strict(),
          isCompleted: Joi.boolean().default(false),
          completedAt: Joi.date().timestamp('javascript').allow(null).default(null),
          createdAt: Joi.date().timestamp('javascript').default(Date.now)
        })
      ).default([]),
      createdAt: Joi.date().timestamp('javascript').default(Date.now)
    })
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdBy', 'createdAt', '_destroy', 'checklists']

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newCardToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      columnId: new ObjectId(validData.columnId),
      createdBy: new ObjectId(validData.createdBy)
    }

    const createdCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd)
    return createdCard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (cardId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({ _id: new ObjectId(cardId) })
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (cardId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    if (updateData.columnId) updateData.columnId = new ObjectId(updateData.columnId)

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteManyByColumnId = async (columnId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({ columnId: new ObjectId(columnId) })
    return result
  } catch (error) { throw new Error(error) }
}

const unshiftNewComment = async (cardId, commentData, activityAt = Date.now()) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      {
        $push: { comments: { $each: [commentData], $position: 0 } },
        $set: { updatedAt: activityAt, lastActivityAt: activityAt }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const updateMembers = async (cardId, incomingMemberInfo, activityAt = Date.now()) => {
  try {
    let updateCondition = {}
    if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.ADD) {
      updateCondition = { $push: { memberIds: new ObjectId(incomingMemberInfo.userId) } }
    }

    if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.REMOVE) {
      updateCondition = { $pull: { memberIds: new ObjectId(incomingMemberInfo.userId) } }
    }

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      {
        ...updateCondition,
        $set: { updatedAt: activityAt, lastActivityAt: activityAt }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const addChecklist = async (cardId, title, activityAt = Date.now()) => {
  try {
    const newChecklist = {
      _id: new ObjectId().toString(),
      title,
      items: [],
      createdAt: activityAt
    }

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      {
        $push: { checklists: newChecklist },
        $set: { updatedAt: activityAt, lastActivityAt: activityAt }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const renameChecklist = async (cardId, checklistId, title, activityAt = Date.now()) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId), 'checklists._id': checklistId },
      {
        $set: {
          'checklists.$.title': title,
          updatedAt: activityAt,
          lastActivityAt: activityAt
        }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteChecklist = async (cardId, checklistId, activityAt = Date.now()) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId), 'checklists._id': checklistId },
      {
        $pull: { checklists: { _id: checklistId } },
        $set: { updatedAt: activityAt, lastActivityAt: activityAt }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const addChecklistItem = async (cardId, checklistId, title, activityAt = Date.now()) => {
  try {
    const newItem = {
      _id: new ObjectId().toString(),
      title,
      isCompleted: false,
      completedAt: null,
      createdAt: activityAt
    }

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId), 'checklists._id': checklistId },
      {
        $push: { 'checklists.$.items': newItem },
        $set: { updatedAt: activityAt, lastActivityAt: activityAt }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const renameChecklistItem = async (cardId, checklistId, itemId, title, activityAt = Date.now()) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      {
        $set: {
          'checklists.$[cl].items.$[it].title': title,
          updatedAt: activityAt,
          lastActivityAt: activityAt
        }
      },
      {
        arrayFilters: [{ 'cl._id': checklistId }, { 'it._id': itemId }],
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const toggleChecklistItem = async (cardId, checklistId, itemId, isCompleted, activityAt = Date.now()) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      {
        $set: {
          'checklists.$[cl].items.$[it].isCompleted': isCompleted,
          'checklists.$[cl].items.$[it].completedAt': isCompleted ? activityAt : null,
          updatedAt: activityAt,
          lastActivityAt: activityAt
        }
      },
      {
        arrayFilters: [{ 'cl._id': checklistId }, { 'it._id': itemId }],
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteChecklistItem = async (cardId, checklistId, itemId, activityAt = Date.now()) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId), 'checklists._id': checklistId },
      {
        $pull: { 'checklists.$.items': { _id: itemId } },
        $set: { updatedAt: activityAt, lastActivityAt: activityAt }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const updateManyComments = async (userInfo) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).updateMany(
      { 'comments.userId': new ObjectId(userInfo._id) },
      { $set: {
        'comments.$[element].userAvatar': userInfo.avatar,
        'comments.$[element].userDisplayName': userInfo.displayName
      } },
      { arrayFilters: [{ 'element.userId': new ObjectId(userInfo._id) }] }
    )

    return result
  } catch (error) { throw new Error(error) }
}

const countAllCards = async () => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).countDocuments({ _destroy: false })
    return result
  } catch (error) { throw new Error(error) }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId,
  unshiftNewComment,
  updateMembers,
  addChecklist,
  renameChecklist,
  deleteChecklist,
  addChecklistItem,
  renameChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  updateManyComments,
  countAllCards
}
