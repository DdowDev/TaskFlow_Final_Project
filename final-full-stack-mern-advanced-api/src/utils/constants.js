/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { env } from '~/config/environment'

// Những domain được phép truy cập tới tài nguyên của Server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173' // Không cần localhost nữa vì ở file config/cors đã luôn luôn cho phép môi trường dev (env.BUILD_MODE === 'dev')

  // Lưu ý: Đây là domain ví dụ sau khi Deploy Production (xem video 75 và video 76 để hiểu rõ kiến thức phần này, còn hiện tại mình đã xóa domain này rồi, đừng cố truy cập làm gì =))
  'https://trello-web-mu.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}
export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}

export const CARD_STATUSES = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED'
}

export const CARD_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
}

export const CARD_ACTIVITY_ACTIONS = {
  CARD_CREATED: 'CARD_CREATED',
  CARD_MOVED: 'CARD_MOVED',
  CARD_ARCHIVED: 'CARD_ARCHIVED',
  CARD_UNARCHIVED: 'CARD_UNARCHIVED',

  STATUS_CHANGED: 'STATUS_CHANGED',
  PRIORITY_CHANGED: 'PRIORITY_CHANGED',
  DATES_CHANGED: 'DATES_CHANGED',
  COMMENT_CREATED: 'COMMENT_CREATED',
  COVER_UPDATED: 'COVER_UPDATED',

  CHECKLIST_CREATED: 'CHECKLIST_CREATED',
  CHECKLIST_RENAMED: 'CHECKLIST_RENAMED',
  CHECKLIST_DELETED: 'CHECKLIST_DELETED',
  CHECKLIST_ITEM_CREATED: 'CHECKLIST_ITEM_CREATED',
  CHECKLIST_ITEM_RENAMED: 'CHECKLIST_ITEM_RENAMED',
  CHECKLIST_ITEM_COMPLETED: 'CHECKLIST_ITEM_COMPLETED',
  CHECKLIST_ITEM_UNCOMPLETED: 'CHECKLIST_ITEM_UNCOMPLETED',
  CHECKLIST_ITEM_DELETED: 'CHECKLIST_ITEM_DELETED',

  MEMBER_JOINED: 'MEMBER_JOINED',
  MEMBER_LEFT: 'MEMBER_LEFT'
}
