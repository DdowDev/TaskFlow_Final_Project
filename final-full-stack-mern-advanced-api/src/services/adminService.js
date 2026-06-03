import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { pickUser } from '~/utils/formatters'

const isSameId = (firstId, secondId) => firstId?.toString() === secondId?.toString()

const getPaging = (query) => ({
  page: Number(query?.page) || DEFAULT_PAGE,
  itemsPerPage: Number(query?.itemsPerPage) || DEFAULT_ITEMS_PER_PAGE
})

const getActiveUserOrThrow = async (userId) => {
  const user = await userModel.findOneById(userId)
  if (!user || user._destroy) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
  return user
}

const getUsers = async (query) => {
  try {
    const { page, itemsPerPage } = getPaging(query)
    const results = await userModel.getUsers(page, itemsPerPage, query?.q)

    return {
      ...results,
      users: results.users.map(user => pickUser(user))
    }
  } catch (error) { throw error }
}

const getUserDetails = async (userId) => {
  try {
    const user = await getActiveUserOrThrow(userId)
    return pickUser(user)
  } catch (error) { throw error }
}

const updateUserStatus = async (adminUserId, userId, reqBody) => {
  try {
    const targetUser = await getActiveUserOrThrow(userId)

    if (reqBody.isBlocked && isSameId(adminUserId, targetUser._id)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'System admin cannot block themself!')
    }

    const updatedUser = await userModel.adminUpdateStatus(userId, reqBody)
    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const updateUserRole = async (adminUserId, userId, reqBody) => {
  try {
    const targetUser = await getActiveUserOrThrow(userId)

    if (isSameId(adminUserId, targetUser._id)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'System admin cannot change their own role!')
    }

    const isDemotingSystemAdmin = userModel.isSystemAdminRole(targetUser.role) && reqBody.role === userModel.USER_ROLES.USER
    if (isDemotingSystemAdmin && targetUser.isActive && !targetUser.isBlocked) {
      const activeSystemAdminCount = await userModel.countActiveSystemAdmins()
      if (activeSystemAdminCount <= 1) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot demote the last active system admin!')
      }
    }

    const updatedUser = await userModel.adminUpdateRole(userId, reqBody.role)
    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const getBoards = async (query) => {
  try {
    const { page, itemsPerPage } = getPaging(query)
    return await boardModel.getAllBoards(page, itemsPerPage, query?.q)
  } catch (error) { throw error }
}

const getDashboard = async () => {
  try {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      totalBoards,
      totalCards
    ] = await Promise.all([
      userModel.countByCondition(),
      userModel.countByCondition({ isActive: true }),
      userModel.countByCondition({ isBlocked: true }),
      boardModel.countAllBoards(),
      cardModel.countAllCards()
    ])

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      totalBoards,
      totalCards
    }
  } catch (error) { throw error }
}

export const adminService = {
  getUsers,
  getUserDetails,
  updateUserStatus,
  updateUserRole,
  getBoards,
  getDashboard
}
