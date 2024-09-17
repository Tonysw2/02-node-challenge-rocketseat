import type { FastifyInstance } from 'fastify'
import AuthController from '../controllers/auth-controller'
import { knex } from '../database'

export async function publicRoutes(app: FastifyInstance) {
  app.post('/sign-up', AuthController.signUp)
  app.post('/sign-in', AuthController.signIn)

  app.get('/users', async (request, reply) => {
    const users = await knex('users')

    reply.code(200).send({
      users,
    })
  })
}
