import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'

describe('Auth routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to sign up', async () => {
    await request(app.server)
      .post('/sign-up')
      .send({
        name: 'Anthony Ribeiro',
        email: 'anthony@email.com',
        password: 'anthony123',
      })
      .expect(201)
  })

  it('should not be able to sign up with an existing email', async () => {
    await request(app.server)
      .post('/sign-up')
      .send({
        name: 'Anthony Ribeiro',
        email: 'anthony@email.com',
        password: 'anthony123',
      })
      .expect(201)

    const signUpResponse = await request(app.server)
      .post('/sign-up')
      .send({
        name: 'Anthony Ribeiro',
        email: 'anthony@email.com',
        password: 'anthony123',
      })
      .expect(409)

    expect(signUpResponse.body).toEqual({
      message: 'User already exists',
    })
  })

  it('should be able to sign in', async () => {
    await request(app.server)
      .post('/sign-up')
      .send({
        name: 'Anthony Ribeiro',
        email: 'anthony@email.com',
        password: 'anthony123',
      })
      .expect(201)

    const signInResponse = await request(app.server)
      .post('/sign-in')
      .send({ email: 'anthony@email.com', password: 'anthony123' })
      .expect(200)

    expect(signInResponse.body).toEqual({
      accessToken: expect.any(String),
    })
  })

  it('should not be able to sign in with an invalid email', async () => {
    await request(app.server)
      .post('/sign-up')
      .send({
        name: 'Anthony Ribeiro',
        email: 'anthony@email.com',
        password: 'anthony123',
      })
      .expect(201)

    const signInResponse = await request(app.server)
      .post('/sign-in')
      .send({
        email: 'another@email.com',
        password: 'anthony123',
      })
      .expect(401)

    expect(signInResponse.body).toEqual({
      message: 'Invalid credentials',
    })
  })

  it('should not be able to sign in with an invalid password', async () => {
    await request(app.server)
      .post('/sign-up')
      .send({
        name: 'Anthony Ribeiro',
        email: 'anthony@email.com',
        password: 'anthony123',
      })
      .expect(201)

    const signInResponse = await request(app.server).post('/sign-in').send({
      email: 'anthony@email.com',
      password: 'another123',
    })

    expect(signInResponse.body).toEqual({
      message: 'Invalid credentials',
    })
  })
})
