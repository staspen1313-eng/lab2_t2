import type { RequestHandler } from 'express'
import { GameError, GameService } from '../services/gameService.ts'

interface RequestBody {
  [key: string]: unknown
}

function isRecord(value: unknown): value is RequestBody {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIngredientPair(value: unknown): value is [string, string] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((ingredientId) => typeof ingredientId === 'string')
  )
}

export function createGameController(gameService = new GameService()) {
  const getCatalog: RequestHandler = (_request, response) => {
    response.json(gameService.getCatalog())
  }

  const brew: RequestHandler = (request, response, next) => {
    const body: unknown = request.body

    if (!isRecord(body) || !isIngredientPair(body.ingredientIds)) {
      response
        .status(400)
        .json({ message: 'Потрібно вибрати рівно два інгредієнти.' })
      return
    }

    try {
      response.json(gameService.brew(body.ingredientIds))
    } catch (error) {
      next(error)
    }
  }

  const getOrders: RequestHandler = (request, response) => {
    const requestedCount = Number(request.query.count ?? 1)
    const excludedQuery = request.query.excludePotionIds

    if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > 5) {
      response.status(400).json({ message: 'Кількість клієнтів має бути від 1 до 5.' })
      return
    }

    if (excludedQuery !== undefined && typeof excludedQuery !== 'string') {
      response.status(400).json({ message: 'Некоректний список зіль для виключення.' })
      return
    }

    const excludedPotionIds =
      typeof excludedQuery === 'string' && excludedQuery.length > 0
        ? excludedQuery.split(',')
        : []

    if (excludedPotionIds.some((potionId) => potionId.length === 0)) {
      response.status(400).json({ message: 'Некоректний список зіль для виключення.' })
      return
    }

    response.json(gameService.createOrders(requestedCount, excludedPotionIds))
  }

  const sell: RequestHandler = (request, response, next) => {
    const body: unknown = request.body

    if (
      !isRecord(body) ||
      typeof body.potionId !== 'string' ||
      typeof body.requestedPotionId !== 'string' ||
      typeof body.tradeBonusPercent !== 'number' ||
      typeof body.tip !== 'number'
    ) {
      response.status(400).json({ message: 'Некоректні дані для продажу.' })
      return
    }

    try {
      response.json(
        gameService.sell(
          body.potionId,
          body.requestedPotionId,
          body.tradeBonusPercent,
          body.tip,
        ),
      )
    } catch (error) {
      if (error instanceof GameError) {
        response.status(error.statusCode).json({ message: error.message })
        return
      }

      next(error)
    }
  }

  return { getCatalog, getOrders, brew, sell }
}
