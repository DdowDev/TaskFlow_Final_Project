import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { activityLogService } from '~/services/activityLogService'

import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { CARD_ACTIVITY_ACTIONS, DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { boardPermissions } from '~/utils/boardPermissions'

const getBoardOrThrow = async (boardId) => {
  const board = await boardModel.findOneById(boardId)
  if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
  return board
}

const verifyBoardOwner = (userId, board) => {
  if (!boardPermissions.isBoardOwner(userId, board)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to perform this action!')
  }
}

const verifyBoardOwnerOrMember = (userId, board) => {
  if (!boardPermissions.isBoardOwnerOrMember(userId, board)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to perform this action!')
  }
}

const isSameId = (firstId, secondId) => firstId?.toString() === secondId?.toString()

const createNew = async (userId, reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(userId, newBoard)

    // Lấy bản ghi board sau khi gọi (tùy mục đích dự án mà có cần bước này hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án...vv
    // Bắn email, notification về cho admin khi có 1 cái board mới được tạo...vv

    // Trả kết quả về, trong Service luôn phải có return
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (userId, boardId) => {
  try {
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // B1: Deep Clone board ra một cái mới để xử lý, không ảnh hưởng tới board ban đầu, tùy mục đích về sau mà có cần clone deep hay không.
    // https://www.javascripttutorial.net/javascript-primitive-vs-reference-values/
    const resBoard = cloneDeep(board)

    // B2: Đưa card về đúng column của nó
    resBoard.columns.forEach(column => {
      // Cách dùng .equals này là bởi vì chúng ta hiểu ObjectId trong MongoDB có support method .equals
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })

    // B3: Xóa mảng cards khỏi board ban đầu
    delete resBoard.cards

    return resBoard
  } catch (error) { throw error }
}

const getDashboard = async (userId, boardId) => {
  try {
    const board = await getBoardOrThrow(boardId)
    if (board._destroy || !boardPermissions.isBoardOwnerOrMember(userId, board)) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    const dashboard = await cardModel.getBoardDashboard(boardId)
    return dashboard
  } catch (error) { throw error }
}

const update = async (userId, boardId, reqBody) => {
  try {
    const board = await getBoardOrThrow(boardId)
    verifyBoardOwner(userId, board)

    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) { throw error }
}

const moveCardToDifferentColumn = async (userInfo, reqBody) => {
  try {
    const userId = userInfo._id
    const currentCard = await cardModel.findOneById(reqBody.currentCardId)
    if (!currentCard) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')

    const prevColumn = await columnModel.findOneById(reqBody.prevColumnId)
    if (!prevColumn) throw new ApiError(StatusCodes.NOT_FOUND, 'Previous column not found!')

    const nextColumn = await columnModel.findOneById(reqBody.nextColumnId)
    if (!nextColumn) throw new ApiError(StatusCodes.NOT_FOUND, 'Next column not found!')

    if (
      !isSameId(currentCard.boardId, prevColumn.boardId) ||
      !isSameId(currentCard.boardId, nextColumn.boardId)
    ) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card and columns were not found in the same board!')
    }

    const board = await getBoardOrThrow(currentCard.boardId)
    verifyBoardOwnerOrMember(userId, board)

    // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    // B3: Cập nhật lại trường columnId mới của cái Card đã kéo
    const activityAt = Date.now()
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
      updatedAt: activityAt,
      lastActivityAt: activityAt
    })

    await activityLogService.safeRecordCardActivity({
      boardId: currentCard.boardId,
      cardId: currentCard._id,
      actor: userInfo,
      action: CARD_ACTIVITY_ACTIONS.CARD_MOVED,
      metadata: {
        fromColumnId: prevColumn._id?.toString(),
        fromColumnTitle: prevColumn.title || null,
        toColumnId: nextColumn._id?.toString(),
        toColumnTitle: nextColumn.title || null
      },
      createdAt: activityAt
    })

    return { updateResult: 'Successfully!' }
  } catch (error) { throw error }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    // Nếu không tồn tại page hoặc itemsPerPage từ phía FE thì BE sẽ cần phải luôn gán giá trị mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilters
    )

    return results
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  getDashboard,
  update,
  moveCardToDifferentColumn,
  getBoards
}
