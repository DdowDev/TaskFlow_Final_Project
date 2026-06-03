import { pick } from 'lodash'

export const slugify = (val) => {
  if (!val) return ''
  return String(val)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Lấy một vài dữ liệu cụ thể trong User để tránh việc trả về các dữ liệu nhạy cảm như hash password
export const pickUser = (user) => {
  if (!user) return {}
  return pick(user, [
    '_id',
    'email',
    'username',
    'displayName',
    'avatar',
    'role',
    'isActive',
    'isBlocked',
    'blockedAt',
    'blockedReason',
    'createdAt',
    'updatedAt'
  ])
}
