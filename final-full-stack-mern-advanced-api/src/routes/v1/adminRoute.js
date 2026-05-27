import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { adminValidation } from '~/validations/adminValidation'
import { adminController } from '~/controllers/adminController'

const Router = express.Router()

Router.use(authMiddleware.isAuthorized, authMiddleware.requireSystemAdmin)

Router.route('/users')
  .get(adminController.getUsers)

Router.route('/users/:id')
  .get(adminValidation.userIdParam, adminController.getUserDetails)

Router.route('/users/:id/status')
  .put(adminValidation.updateUserStatus, adminController.updateUserStatus)

Router.route('/users/:id/role')
  .put(adminValidation.updateUserRole, adminController.updateUserRole)

Router.route('/boards')
  .get(adminController.getBoards)

Router.route('/dashboard')
  .get(adminController.getDashboard)

export const adminRoute = Router
