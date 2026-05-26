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

const createNew = async (userId, reqBody) => {
  try {
    const board = await getBoardOrThrow(reqBody.boardId)
    const column = await columnModel.findOneById(reqBody.columnId)
    if (!column) throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    if (!isSameId(board._id, column.boardId)) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column was not found in this board!')
    }
    verifyBoardOwnerOrMember(userId, board)

    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật mảng cardOrderIds trong collection columns
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

    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
    } else if (updateData.commentToAdd) {
      // Tạo dữ liệu comment để thêm vào Database, cần bổ sung thêm những field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else if (updateData.incomingMemberInfo) {
      // Trường hợp ADD hoặc REMOVE thành viên ra khỏi Card
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
    } else {
      // Các trường hợp update chung như title, description
      updatedCard = await cardModel.update(cardId, updateData)
    }


    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update
}
