/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { boardPermissions } from '~/utils/boardPermissions'
import { CARD_PRIORITIES, CARD_STATUSES } from '~/utils/constants'

const SENSITIVE_CLIENT_UPDATE_FIELDS = [
  '_id',
  'boardId',
  'createdBy',
  'createdAt',
  'completedAt',
  'lastActivityAt',
  'checklists',
  '_destroy'
]

const CHECKLIST_ACTION_FIELDS = [
  'checklistToAdd',
  'checklistToRename',
  'checklistToDelete',
  'checklistItemToAdd',
  'checklistItemToRename',
  'checklistItemToToggle',
  'checklistItemToDelete'
]

const MAX_CHECKLISTS_PER_CARD = 5
const MAX_ITEMS_PER_CHECKLIST = 20

const getBoardOrThrow = async (boardId) => {
  const board = await boardModel.findOneById(boardId)
  if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
  return board
}

const verifyBoardOwnerOrMember = (userId, board) => {
  if (!boardPermissions.isBoardOwnerOrMember(userId, board)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to perform this action!')
  }
}

const isSameId = (firstId, secondId) => firstId?.toString() === secondId?.toString()

const sanitizeClientUpdateData = (reqBody) => {
  const updateData = { ...reqBody }
  SENSITIVE_CLIENT_UPDATE_FIELDS.forEach(fieldName => {
    delete updateData[fieldName]
  })
  return updateData
}

const normalizeDateValue = (value) => {
  if (typeof value === 'undefined') return undefined
  if (value === null || value === '') return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Invalid card date value!')
  }

  return date.getTime()
}

const normalizeExistingDateValue = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

const validateMergedDateRange = (targetCard, updateData) => {
  const incomingStartDate = normalizeDateValue(updateData.startDate)
  const incomingDueDate = normalizeDateValue(updateData.dueDate)

  if (typeof incomingStartDate !== 'undefined') updateData.startDate = incomingStartDate
  if (typeof incomingDueDate !== 'undefined') updateData.dueDate = incomingDueDate

  const mergedStartDate = typeof incomingStartDate !== 'undefined'
    ? incomingStartDate
    : normalizeExistingDateValue(targetCard.startDate)
  const mergedDueDate = typeof incomingDueDate !== 'undefined'
    ? incomingDueDate
    : normalizeExistingDateValue(targetCard.dueDate)

  if (mergedStartDate && mergedDueDate && mergedStartDate > mergedDueDate) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Start date must be before or equal to due date!')
  }
}

const applyStatusSideEffects = (targetCard, updateData, activityAt) => {
  if (!Object.prototype.hasOwnProperty.call(updateData, 'status')) return

  if (updateData.status === CARD_STATUSES.DONE) {
    updateData.completedAt = targetCard.completedAt || activityAt
    return
  }

  if (targetCard.status === CARD_STATUSES.DONE) {
    updateData.completedAt = null
  }
}

const getCardChecklists = (card) => {
  return Array.isArray(card?.checklists) ? card.checklists : []
}

const getChecklistOrThrow = (targetCard, checklistId) => {
  const checklist = getCardChecklists(targetCard).find(item => item._id === checklistId)
  if (!checklist) throw new ApiError(StatusCodes.NOT_FOUND, 'Checklist not found')
  return checklist
}

const getChecklistItemOrThrow = (checklist, itemId) => {
  const item = Array.isArray(checklist?.items)
    ? checklist.items.find(checklistItem => checklistItem._id === itemId)
    : null

  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Checklist item not found')
  return item
}

const normalizeChecklistTitle = (title) => title.trim()

const getChecklistActionField = (updateData) => {
  const checklistActions = CHECKLIST_ACTION_FIELDS.filter(fieldName =>
    Object.prototype.hasOwnProperty.call(updateData, fieldName)
  )

  if (checklistActions.length > 1) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Only one checklist action is allowed per request!')
  }

  return checklistActions[0] || null
}

const handleChecklistAction = async (cardId, targetCard, updateData, activityAt) => {
  const actionField = getChecklistActionField(updateData)
  if (!actionField) return null

  const actionPayload = updateData[actionField]
  let updatedCard = null

  switch (actionField) {
  case 'checklistToAdd': {
    if (getCardChecklists(targetCard).length >= MAX_CHECKLISTS_PER_CARD) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Maximum 5 checklists per card')
    }

    updatedCard = await cardModel.addChecklist(
      cardId,
      normalizeChecklistTitle(actionPayload.title),
      activityAt
    )
    break
  }

  case 'checklistToRename': {
    getChecklistOrThrow(targetCard, actionPayload.checklistId)
    updatedCard = await cardModel.renameChecklist(
      cardId,
      actionPayload.checklistId,
      normalizeChecklistTitle(actionPayload.title),
      activityAt
    )
    break
  }

  case 'checklistToDelete': {
    getChecklistOrThrow(targetCard, actionPayload.checklistId)
    updatedCard = await cardModel.deleteChecklist(cardId, actionPayload.checklistId, activityAt)
    break
  }

  case 'checklistItemToAdd': {
    const checklist = getChecklistOrThrow(targetCard, actionPayload.checklistId)
    const checklistItems = Array.isArray(checklist.items) ? checklist.items : []
    if (checklistItems.length >= MAX_ITEMS_PER_CHECKLIST) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Maximum 20 items per checklist')
    }

    updatedCard = await cardModel.addChecklistItem(
      cardId,
      actionPayload.checklistId,
      normalizeChecklistTitle(actionPayload.title),
      activityAt
    )
    break
  }

  case 'checklistItemToRename': {
    const checklist = getChecklistOrThrow(targetCard, actionPayload.checklistId)
    getChecklistItemOrThrow(checklist, actionPayload.itemId)
    updatedCard = await cardModel.renameChecklistItem(
      cardId,
      actionPayload.checklistId,
      actionPayload.itemId,
      normalizeChecklistTitle(actionPayload.title),
      activityAt
    )
    break
  }

  case 'checklistItemToToggle': {
    const checklist = getChecklistOrThrow(targetCard, actionPayload.checklistId)
    getChecklistItemOrThrow(checklist, actionPayload.itemId)
    updatedCard = await cardModel.toggleChecklistItem(
      cardId,
      actionPayload.checklistId,
      actionPayload.itemId,
      actionPayload.isCompleted,
      activityAt
    )
    break
  }

  case 'checklistItemToDelete': {
    const checklist = getChecklistOrThrow(targetCard, actionPayload.checklistId)
    getChecklistItemOrThrow(checklist, actionPayload.itemId)
    updatedCard = await cardModel.deleteChecklistItem(
      cardId,
      actionPayload.checklistId,
      actionPayload.itemId,
      activityAt
    )
    break
  }

  default:
    return null
  }

  if (!updatedCard) {
    throw new ApiError(StatusCodes.NOT_FOUND, actionField.includes('Item') ? 'Checklist item not found' : 'Checklist not found')
  }

  return updatedCard
}

const createNew = async (userId, reqBody) => {
  try {
    const board = await getBoardOrThrow(reqBody.boardId)
    const column = await columnModel.findOneById(reqBody.columnId)
    if (!column) throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    if (!isSameId(board._id, column.boardId)) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column was not found in this board!')
    }
    verifyBoardOwnerOrMember(userId, board)

    const createdAt = Date.now()
    const newCard = {
      boardId: reqBody.boardId,
      columnId: reqBody.columnId,
      title: reqBody.title,
      createdBy: userId,
      status: CARD_STATUSES.TODO,
      priority: CARD_PRIORITIES.MEDIUM,
      startDate: null,
      dueDate: null,
      completedAt: null,
      lastActivityAt: createdAt,
      createdAt
    }

    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) { throw error }
}

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')

    const board = await getBoardOrThrow(targetCard.boardId)
    verifyBoardOwnerOrMember(userInfo._id, board)

    const activityAt = Date.now()
    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url,
        updatedAt: activityAt,
        lastActivityAt: activityAt
      })
    } else {
      const updateData = sanitizeClientUpdateData(reqBody)

      if (updateData.commentToAdd) {
        const commentData = {
          ...updateData.commentToAdd,
          commentedAt: activityAt,
          userId: userInfo._id,
          userEmail: userInfo.email
        }
        updatedCard = await cardModel.unshiftNewComment(cardId, commentData, activityAt)
      } else if (updateData.incomingMemberInfo) {
        updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo, activityAt)
      } else {
        const checklistUpdatedCard = await handleChecklistAction(cardId, targetCard, updateData, activityAt)
        if (checklistUpdatedCard) return checklistUpdatedCard

        validateMergedDateRange(targetCard, updateData)
        applyStatusSideEffects(targetCard, updateData, activityAt)

        if (Object.keys(updateData).length === 0) return targetCard

        updateData.updatedAt = activityAt
        updateData.lastActivityAt = activityAt

        updatedCard = await cardModel.update(cardId, updateData)
      }
    }

    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update
}
