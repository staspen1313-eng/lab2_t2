import cors from 'cors'
import express from 'express'
import { GameError } from './services/gameService.ts'
import { createGameRoutes } from './routes/gameRoutes.ts'

const app = express()
const port = Number(process.env.PORT ?? 3001)
const allowedOrigins = process.env.CORS_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }))
app.use(express.json({ limit: '16kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api', createGameRoutes())

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    if (response.headersSent) {
      next(error)
      return
    }

    if (error instanceof GameError) {
      response.status(error.statusCode).json({ message: error.message })
      return
    }

    console.error('Unhandled API error:', error)
    response.status(500).json({ message: 'Внутрішня помилка сервера.' })
  },
)

app.listen(port, () => {
  console.info(`Alchemy API is listening on port ${port}.`)
})
