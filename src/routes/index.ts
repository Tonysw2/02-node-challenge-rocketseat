import type { FastifyInstance } from 'fastify'
import { privateRoutes } from './private-routes'
import { publicRoutes } from './public-routes'

export async function routes(app: FastifyInstance) {
  app.register(publicRoutes)
  app.register(privateRoutes)
}
