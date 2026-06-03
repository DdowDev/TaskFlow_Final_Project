import { StatusCodes } from 'http-status-codes'
import { adminService } from '~/services/adminService'

const getUsers = async (req, res, next) => {
  try {
    const results = await adminService.getUsers(req.query)
    res.status(StatusCodes.OK).json(results)
  } catch (error) { next(error) }
}

const getUserDetails = async (req, res, next) => {
  try {
    const result = await adminService.getUserDetails(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const updateUserStatus = async (req, res, next) => {
  try {
    const result = await adminService.updateUserStatus(req.currentUser._id, req.params.id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const updateUserRole = async (req, res, next) => {
  try {
    const result = await adminService.updateUserRole(req.currentUser._id, req.params.id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getBoards = async (req, res, next) => {
  try {
    const results = await adminService.getBoards(req.query)
    res.status(StatusCodes.OK).json(results)
  } catch (error) { next(error) }
}

const getDashboard = async (req, res, next) => {
  try {
    const result = await adminService.getDashboard()
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const adminController = {
  getUsers,
  getUserDetails,
  updateUserStatus,
  updateUserRole,
  getBoards,
  getDashboard
}
