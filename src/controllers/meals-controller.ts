import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

class MealsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      date_time: z.string().datetime(),
      in_diet: z.boolean(),
    })

    const { name, description, date_time, in_diet } = bodySchema.parse(
      request.body,
    )

    const userId = request.user.id

    await knex('meals').insert({
      name,
      description,
      date_time,
      in_diet,
      user_id: userId,
    })

    reply.code(201)
  }

  async listAll(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id

    const meals = await knex('meals').select('*').where('user_id', userId)

    reply.code(200).send({
      meals,
    })
  }

  async listById(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
      mealId: z.string().uuid(),
    })

    const { mealId } = paramsSchema.parse(request.params)

    const userId = request.user.id

    const meals = await knex('meals')
      .where('id', mealId)
      .andWhere('user_id', userId)

    reply.code(200).send({
      meals,
    })
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
      mealId: z.string().uuid(),
    })

    const { mealId } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      date_time: z.string().datetime().optional(),
      in_diet: z.boolean().optional(),
    })

    const { name, description, date_time, in_diet } = bodySchema.parse(
      request.body,
    )

    await knex('meals')
      .update({
        name,
        description,
        date_time,
        in_diet,
      })
      .where('id', mealId)

    reply.code(204)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
      mealId: z.string().uuid(),
    })

    const { mealId } = paramsSchema.parse(request.params)

    await knex('meals').delete().where('id', mealId)

    reply.code(204)
  }

  async metrics(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id

    const result = (await knex('meals')
      .select(
        knex.raw('CAST(COUNT(id) AS INTEGER) as total'),
        knex.raw(
          'CAST(SUM(CASE WHEN in_diet = true THEN 1 ELSE 0 END) AS INTEGER) as total_in_diet',
        ),
        knex.raw(
          'CAST(SUM(CASE WHEN in_diet = false THEN 1 ELSE 0 END) AS INTEGER) as total_off_diet',
        ),
      )
      // biome-ignore lint/suspicious/noExplicitAny:
      .where('user_id', userId)) as any[]

    const meals = await knex('meals')
      .where('user_id', userId)
      .orderBy('date_time', 'asc')

    const { bestOnDietSequence } = meals.reduce(
      (acc, meal) => {
        if (meal.in_diet) {
          acc.bestOnDietSequence += 1
        } else {
          acc.currentSequence = 0
        }

        if (acc.currentSequence > acc.bestOnDietSequence) {
          acc.bestOnDietSequence = acc.currentSequence
        }

        return acc
      },
      {
        bestOnDietSequence: 0,
        currentSequence: 0,
      },
    )

    reply.code(200).send({
      total: result[0].total,
      total_in_diet: result[0].total_in_diet,
      total_off_diet: result[0].total_off_diet,
      best_on_diet_sequence: bestOnDietSequence,
    })
  }
}

export default new MealsController()
