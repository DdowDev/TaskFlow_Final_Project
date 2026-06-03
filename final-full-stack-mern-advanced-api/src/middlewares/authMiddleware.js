import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { pickUser } from '~/utils/formatters'

const isAuthorized = async (req, res, next) => {
  const clientAccessToken = req.cookies?.accessToken

  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return
  }

  try {
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )

    const currentUser = await userModel.findOneById(accessTokenDecoded._id)
    if (!currentUser || currentUser._destroy) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
      return
    }

    if (!currentUser.isActive) {
      next(new ApiError(StatusCodes.FORBIDDEN, 'Your account is not active!'))
      return
    }

    if (currentUser.isBlocked) {
      next(new ApiError(StatusCodes.FORBIDDEN, 'Your account has been blocked!'))
      return
    }

    const safeCurrentUser = pickUser(currentUser)

    req.currentUser = safeCurrentUser
    req.jwtDecoded = {
      ...accessTokenDecoded,
      ...safeCurrentUser,
      _id: accessTokenDecoded._id
    }

    next()
  } catch (error) {
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
      return
    }

    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

const requireSystemAdmin = async (req, res, next) => {
  if (!req.currentUser || !userModel.isSystemAdminRole(req.currentUser.role)) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'System admin permission required!'))
    return
  }

  next()
}

export const authMiddleware = {
  isAuthorized,
  requireSystemAdmin
}
