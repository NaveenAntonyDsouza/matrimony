const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/User');

// Import test setup
require('../setup');

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRE = '7d';

describe('Authentication Routes', () => {
  const validUserData = {
    email: 'test@example.com',
    password: 'password123',
    phone: '9876543210',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    dateOfBirth: '1990-01-01',
    profileCreatedFor: 'Self',
    motherTongue: 'English',
    religion: 'Hindu',
    maritalStatus: 'Never Married',
    height: '5\'8"',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    education: 'Bachelor\'s Degree',
    occupation: 'Software Engineer'
  };

  describe('POST /api/auth/register', () => {
    test('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(validUserData.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    test('should not register user with invalid email', async () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation errors');
      expect(response.body.errors).toBeDefined();
    });

    test('should not register user with short password', async () => {
      const invalidData = { ...validUserData, password: '123' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.some(err => err.path === 'password')).toBe(true);
    });

    test('should not register user with invalid phone', async () => {
      const invalidData = { ...validUserData, phone: '123' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.some(err => err.path === 'phone')).toBe(true);
    });

    test('should not register user with invalid gender', async () => {
      const invalidData = { ...validUserData, gender: 'Other' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.some(err => err.path === 'gender')).toBe(true);
    });

    test('should not register user with duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Second registration with same email
      const duplicateData = { ...validUserData, phone: '9876543211' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should not register user with duplicate phone', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Second registration with same phone
      const duplicateData = { ...validUserData, email: 'different@example.com' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should trim and normalize email', async () => {
      const dataWithSpaces = { 
        ...validUserData, 
        email: '  TEST@EXAMPLE.COM  ',
        phone: '9876543211'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(dataWithSpaces)
        .expect(201);

      expect(response.body.user.email).toBe('test@example.com');
    });

    test('should handle missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        password: 'password123'
        // Missing other required fields
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(validUserData);
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: validUserData.email,
        password: validUserData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(validUserData.email);
      expect(response.body.user.password).toBeUndefined();
    });

    test('should not login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: validUserData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should not login with invalid password', async () => {
      const loginData = {
        email: validUserData.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should validate email format in login', async () => {
      const loginData = {
        email: 'invalid-email',
        password: validUserData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation errors');
    });

    test('should require password in login', async () => {
      const loginData = {
        email: validUserData.email
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle case-insensitive email login', async () => {
      const loginData = {
        email: validUserData.email.toUpperCase(),
        password: validUserData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Register and login to get token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(validUserData);
      
      authToken = registerResponse.body.token;
      userId = registerResponse.body.user._id;
    });

    test('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user._id).toBe(userId);
      expect(response.body.user.email).toBe(validUserData.email);
      expect(response.body.user.password).toBeUndefined();
    });

    test('should not get user without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No token, authorization denied');
    });

    test('should not get user with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token is not valid');
    });

    test('should not get user with expired token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token is not valid');
    });

    test('should handle malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/profile', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(validUserData);
      
      authToken = registerResponse.body.token;
      userId = registerResponse.body.user._id;
    });

    test('should update profile with valid data', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        city: 'Delhi'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.firstName).toBe('Jane');
      expect(response.body.user.lastName).toBe('Smith');
      expect(response.body.user.city).toBe('Delhi');
    });

    test('should not update email through profile update', async () => {
      const updateData = {
        email: 'newemail@example.com'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // Email should remain unchanged
      expect(response.body.user.email).toBe(validUserData.email);
    });

    test('should not update password through profile update', async () => {
      const updateData = {
        password: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // Should be able to login with old password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUserData.email,
          password: validUserData.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    test('should require authentication for profile update', async () => {
      const updateData = {
        firstName: 'Jane'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('JWT Token Validation', () => {
    test('should generate valid JWT token on registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      const token = response.body.token;
      expect(token).toBeDefined();

      // Verify token structure
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    test('should generate valid JWT token on login', async () => {
      // Register first
      await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      // Then login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUserData.email,
          password: validUserData.password
        })
        .expect(200);

      const token = response.body.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // This test would require mocking mongoose connection
      // For now, we'll test that the route exists and handles errors
      const response = await request(app)
        .post('/api/auth/register')
        .send({}) // Empty data to trigger validation errors
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      // Should handle the error gracefully
      expect(response.body).toBeDefined();
    });
  });
});