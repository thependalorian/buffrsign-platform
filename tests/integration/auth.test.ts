import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../apps/api/app'

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    // Clear test database
  })

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test @example.com',
        password: 'SecurePassword123!',
        full_name: 'Test User',
        account_type: 'individual'
      }

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(200)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        full_name: userData.full_name,
        account_type: userData.account_type,
        is_verified: false
      })
    })

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'duplicate @example.com',
        password: 'SecurePassword123!',
        full_name: 'Test User',
        account_type: 'individual'
      }

      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(200)

      // Duplicate registration
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400)
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      // First register a user
      const userData = {
        email: 'login @example.com',
        password: 'SecurePassword123!',
        full_name: 'Login User',
        account_type: 'individual'
      }

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)

      // Then login
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200)

      expect(response.body).toMatchObject({
        access_token: expect.any(String),
        token_type: 'bearer',
        expires_in: 86400,
        user: {
          email: userData.email,
          full_name: userData.full_name
        }
      })
    })

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent @example.com',
          password: 'wrongpassword'
        })
        .expect(401)
    })
  })
})
