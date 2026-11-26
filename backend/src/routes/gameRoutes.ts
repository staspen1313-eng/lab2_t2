import { Router } from 'express'
import { createGameController } from '../controllers/gameController.ts'

export function createGameRoutes() {
  const router = Router()
  const controller = createGameController()

  router.get('/catalog', controller.getCatalog)
  router.get('/orders', controller.getOrders)
  router.post('/brew', controller.brew)
  router.post('/sell', controller.sell)

  return router
}
