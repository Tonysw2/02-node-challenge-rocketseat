import type { FastifyInstance } from 'fastify'
import mealsController from '../controllers/meals-controller'
import { authMiddleware } from '../middlewares/auth-middleware'

export async function privateRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware)

  app.post('/meals', mealsController.create)
  app.get('/meals', mealsController.listAll)
  app.get('/meals/:mealId', mealsController.listById)
  app.put('/meals/:mealId', mealsController.update)
  app.delete('/meals/:mealId', mealsController.delete)
  app.get('/meals/metrics', mealsController.metrics)
}
