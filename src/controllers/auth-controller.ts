import { compare, hash } from 'bcryptjs'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { app } from '../app'
import { knex } from '../database'

class AuthController {
  async signUp(request: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
    })

    const { name, email, password } = bodySchema.parse(request.body)

    const userExists = await knex('users').select('id').where('email', email)

    if (userExists[0]) {
      reply.code(409).send({
        message: 'User already exists',
      })
    }

    const hashedPassword = await hash(password, 10)

    await knex('users').insert({
      name,
      email,
      password: hashedPassword,
    })

    reply.code(201)
  }

  async signIn(request: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })

    const { email, password } = bodySchema.parse(request.body)

    const user = await knex('users').select('*').where('email', email)

    if (!user[0]) {
      reply.code(401).send({ message: 'Invalid credentials' })
    }

    const isValidPassword = await compare(password, user[0].password)

    if (!isValidPassword) {
      reply.code(401).send({ message: 'Invalid credentials' })
    }

    const accessToken = app.jwt.sign(
      {
        id: user[0].id,
        email,
      },
      {
        expiresIn: '1h',
      },
    )

    reply.code(200).send({ accessToken })
  }
}

export default new AuthController()
