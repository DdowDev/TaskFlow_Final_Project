import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { activityLogModel } from '~/models/activityLogModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { boardPermissions } from '~/utils/boardPermissions'
import { CARD_ACTIVITY_ACTIONS } from '~/utils/constants'

const DEFAULT_ACTIVITY_ITEMS_PER_PAGE = 20
const MAX_ACTIVITY_ITEMS_PER_PAGE = 50

const normalizePaging = (query) => {
  const page = Math.max(Number(query?.page) || 1, 1)
  const requestedItemsPerPage = Number(query?.itemsPerPage) || DEFAULT_ACTIVITY_ITEMS_PER_PAGE
  const itemsPerPage = Math.min(Math.max(requestedItemsPerPage, 1), MAX_ACTIVITY_ITEMS_PER_PAGE)

  return {
    page,
    itemsPerPage,
    skip: (page - 1) * itemsPerPage
  }
}

const getActivityQueryOptions = (query) => {
  const excludedActions = []

  if (query?.excludeCommentCreated === 'true') {
    excludedActions.push(CARD_ACTIVITY_ACTIONS.COMMENT_CREATED)
  }

  return { excludedActions }
}

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

const buildActorSnapshot = (actor) => ({
  actorId: actor?._id,
  actorEmail: actor?.email,
  actorDisplayName: actor?.displayName || actor?.username || actor?.email,
  actorAvatar: actor?.avatar || null
})

const recordCardActivity = async ({ boardId, cardId, actor, action, metadata = {}, createdAt = Date.now() }) => {
  const actorSnapshot = buildActorSnapshot(actor)

  return await activityLogModel.createNew({
    boardId: boardId?.toString(),
    cardId: cardId?.toString(),
    ...actorSnapshot,
    action,
    metadata,
    createdAt
  })
}

const safeRecordCardActivity = async (payload) => {
  try {
    await recordCardActivity(payload)
  } catch (error) {
    // Activity log must never break the main business action.
    // eslint-disable-next-line no-console
    console.error('Failed to record card activity:', error)
  }
}

const getCardActivities = async (userId, cardId, query) => {
  try {
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')

    const board = await getBoardOrThrow(targetCard.boardId)
    verifyBoardOwnerOrMember(userId, board)

    const { page, itemsPerPage, skip } = normalizePaging(query)
    const activityQueryOptions = getActivityQueryOptions(query)
    const [activities, totalActivities] = await Promise.all([
      activityLogModel.getByCardId(cardId, skip, itemsPerPage, activityQueryOptions),
      activityLogModel.countByCardId(cardId, activityQueryOptions)
    ])

    return {
      activities,
      totalActivities,
      page,
      itemsPerPage
    }
  } catch (error) { throw error }
}

export const activityLogService = {
  recordCardActivity,
  safeRecordCardActivity,
  getCardActivities
}
