import type { FastifyReply, FastifyRequest } from 'fastify'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
}
