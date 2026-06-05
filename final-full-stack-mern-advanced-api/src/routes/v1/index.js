import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from '~/routes/v1/boardRoute'
import { columnRoute } from '~/routes/v1/columnRoute'
import { cardRoute } from '~/routes/v1/cardRoute'
import { userRoute } from '~/routes/v1/userRoute'
import { invitationRoute } from '~/routes/v1/invitationRoute'
import { adminRoute } from '~/routes/v1/adminRoute'
import { aiRoute } from '~/routes/v1/aiRoute'

const Router = express.Router()

/** Check APIs v1/status */
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' })
})

/** Board APIs */
Router.use('/boards', boardRoute)

/** Column APIs */
Router.use('/columns', columnRoute)

/** Cards APIs */
Router.use('/cards', cardRoute)

/** User APIs */
Router.use('/users', userRoute)

/** Invitation APIs */
Router.use('/invitations', invitationRoute)

/** Admin APIs */
Router.use('/admin', adminRoute)

/** AI Assistant APIs */
Router.use('/ai', aiRoute)

export const APIs_V1 = Router
