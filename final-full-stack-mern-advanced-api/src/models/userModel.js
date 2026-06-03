import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { pagingSkipValue } from '~/utils/algorithms'

const USER_ROLES = {
  USER: 'user',
  SYSTEM_ADMIN: 'system_admin'
}

// Temporary compatibility with old DB roles during migration.
const LEGACY_USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

const ALL_USER_ROLES = [
  ...Object.values(USER_ROLES),
  ...Object.values(LEGACY_USER_ROLES)
]

const SYSTEM_ADMIN_COMPATIBLE_ROLES = [
  USER_ROLES.SYSTEM_ADMIN,
  LEGACY_USER_ROLES.ADMIN
]

// Define Collection (name & schema)
const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE), // unique
  password: Joi.string().required(),
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(...ALL_USER_ROLES).default(USER_ROLES.USER),

  isActive: Joi.boolean().default(false),
  isBlocked: Joi.boolean().default(false),
  blockedAt: Joi.date().timestamp('javascript').default(null),
  blockedReason: Joi.string().allow(null).default(null),
  verifyToken: Joi.string(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = [
  '_id',
  'email',
  'username',
  'role',
  'isActive',
  'isBlocked',
  'blockedAt',
  'blockedReason',
  'verifyToken',
  '_destroy',
  'createdAt',
  'updatedAt'
]

const PUBLIC_USER_PROJECTION = { password: 0, verifyToken: 0 }

const buildUserQueryConditions = (queryFilters) => {
  const queryConditions = [{ _destroy: false }]
  const allowedSearchFields = ['email', 'username', 'displayName', 'role']

  if (queryFilters) {
    Object.keys(queryFilters).forEach(key => {
      if (allowedSearchFields.includes(key)) {
        queryConditions.push({ [key]: { $regex: new RegExp(queryFilters[key], 'i') } })
      }
    })
  }

  return queryConditions
}

const isSystemAdminRole = (role) => SYSTEM_ADMIN_COMPATIBLE_ROLES.includes(role)

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
    return createdUser
  } catch (error) { throw new Error(error) }
}

const findOneById = async (userId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
    return result
  } catch (error) { throw new Error(error) }
}

const findOneByEmail = async (emailValue) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: emailValue })
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (userId, updateData) => {
  try {
    const sanitizedUpdateData = { ...updateData }

    Object.keys(sanitizedUpdateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete sanitizedUpdateData[fieldName]
      }
    })

    sanitizedUpdateData.updatedAt = Date.now()

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: sanitizedUpdateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const verifyAccount = async (userId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { isActive: true, verifyToken: null, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const getUsers = async (page, itemsPerPage, queryFilters) => {
  try {
    const queryConditions = buildUserQueryConditions(queryFilters)

    const query = await GET_DB().collection(USER_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $sort: { createdAt: -1 } },
      { $project: PUBLIC_USER_PROJECTION },
      { $facet: {
        'queryUsers': [
          { $skip: pagingSkipValue(page, itemsPerPage) },
          { $limit: itemsPerPage }
        ],
        'queryTotalUsers': [{ $count: 'countedAllUsers' }]
      } }
    ]).toArray()

    const res = query[0]
    return {
      users: res.queryUsers || [],
      totalUsers: res.queryTotalUsers[0]?.countedAllUsers || 0
    }
  } catch (error) { throw new Error(error) }
}

const adminUpdateStatus = async (userId, statusData) => {
  try {
    const isBlocked = statusData.isBlocked
    const updateData = {
      isBlocked,
      blockedAt: isBlocked ? Date.now() : null,
      blockedReason: isBlocked ? statusData.blockedReason || null : null,
      updatedAt: Date.now()
    }

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const adminUpdateRole = async (userId, role) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { role, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const countByCondition = async (condition = {}) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).countDocuments({
      _destroy: false,
      ...condition
    })
    return result
  } catch (error) { throw new Error(error) }
}

const countActiveSystemAdmins = async () => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).countDocuments({
      _destroy: false,
      isActive: true,
      isBlocked: { $ne: true },
      role: { $in: SYSTEM_ADMIN_COMPATIBLE_ROLES }
    })
    return result
  } catch (error) { throw new Error(error) }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  USER_ROLES,
  LEGACY_USER_ROLES,
  ALL_USER_ROLES,
  SYSTEM_ADMIN_COMPATIBLE_ROLES,
  isSystemAdminRole,
  createNew,
  findOneById,
  findOneByEmail,
  update,
  verifyAccount,
  getUsers,
  adminUpdateStatus,
  adminUpdateRole,
  countByCondition,
  countActiveSystemAdmins
}
