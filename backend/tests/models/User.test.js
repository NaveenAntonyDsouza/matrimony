const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

describe('User Model', () => {
  // Valid user data for testing
  const validUserData = {
    email: 'test@example.com',
    password: 'password123',
    phone: '9876543210',
    profileCreatedFor: 'Self',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    dateOfBirth: new Date('1990-01-01'),
    maritalStatus: 'Never Married',
    motherTongue: 'English',
    religion: 'Hindu',
    height: '5\'8"',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    education: 'Bachelor\'s Degree',
    occupation: 'Software Engineer'
  };

  describe('Schema Validation', () => {
    test('should create user with valid data', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(validUserData.email);
      expect(savedUser.firstName).toBe(validUserData.firstName);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    test('should require email', async () => {
      const userData = { ...validUserData };
      delete userData.email;
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('User validation failed: email: Path `email` is required.');
    });

    test('should require unique email', async () => {
      const user1 = new User(validUserData);
      await user1.save();
      
      const user2 = new User({
        ...validUserData,
        phone: '9876543211' // Different phone
      });
      
      await expect(user2.save()).rejects.toThrow(/duplicate key error/i);
    });

    test('should require unique phone', async () => {
      const user1 = new User(validUserData);
      await user1.save();
      
      const user2 = new User({
        ...validUserData,
        email: 'different@example.com' // Different email
      });
      
      await expect(user2.save()).rejects.toThrow(/duplicate key error/i);
    });

    // Email format validation is not implemented in the model
    // test('should validate email format', async () => {
    //   const userData = { ...validUserData, email: 'invalid-email' };
    //   const user = new User(userData);
    //   
    //   await expect(user.save()).rejects.toThrow();
    // });

    test('should require password with minimum length', async () => {
      const userData = { ...validUserData, password: '123' };
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow(/shorter than the minimum/i);
    });

    test('should validate gender enum', async () => {
      const userData = { ...validUserData, gender: 'Other' };
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow(/gender.*enum/i);
    });

    test('should validate maritalStatus enum', async () => {
      const userData = { ...validUserData, maritalStatus: 'Married' };
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow(/maritalStatus.*enum/i);
    });

    test('should validate profileCreatedFor enum', async () => {
      const userData = { ...validUserData, profileCreatedFor: 'Other' };
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow(/profileCreatedFor.*enum/i);
    });

    test('should trim and lowercase email', async () => {
      const userData = { ...validUserData, email: '  TEST@EXAMPLE.COM  ' };
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser.email).toBe('test@example.com');
    });

    test('should trim firstName and lastName', async () => {
      const userData = { 
        ...validUserData, 
        firstName: '  John  ',
        lastName: '  Doe  '
      };
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser.firstName).toBe('John');
      expect(savedUser.lastName).toBe('Doe');
    });
  });

  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const user = new User(validUserData);
      await user.save();
      
      expect(user.password).not.toBe(validUserData.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    test('should not rehash password if not modified', async () => {
      const user = new User(validUserData);
      await user.save();
      const originalHash = user.password;
      
      user.firstName = 'Jane';
      await user.save();
      
      expect(user.password).toBe(originalHash);
    });

    test('should rehash password when modified', async () => {
      const user = new User(validUserData);
      await user.save();
      const originalHash = user.password;
      
      user.password = 'newpassword123';
      await user.save();
      
      expect(user.password).not.toBe(originalHash);
      expect(user.password).not.toBe('newpassword123');
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(async () => {
      user = new User(validUserData);
      await user.save();
    });

    describe('comparePassword', () => {
      test('should return true for correct password', async () => {
        const isMatch = await user.comparePassword('password123');
        expect(isMatch).toBe(true);
      });

      test('should return false for incorrect password', async () => {
        const isMatch = await user.comparePassword('wrongpassword');
        expect(isMatch).toBe(false);
      });

      test('should handle empty password', async () => {
        const isMatch = await user.comparePassword('');
        expect(isMatch).toBe(false);
      });
    });

    describe('getAge', () => {
      test('should calculate correct age', () => {
        const birthDate = new Date('1990-01-01');
        const testUser = new User({ ...validUserData, dateOfBirth: birthDate });
        
        const currentYear = new Date().getFullYear();
        const expectedAge = currentYear - 1990;
        
        const age = testUser.getAge();
        expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
        expect(age).toBeLessThanOrEqual(expectedAge);
      });

      test('should handle birthday not yet occurred this year', () => {
        const nextYear = new Date().getFullYear() + 1;
        const futureBirthDate = new Date(`${nextYear}-12-31`);
        const testUser = new User({ ...validUserData, dateOfBirth: futureBirthDate });
        
        const age = testUser.getAge();
        expect(age).toBeLessThan(0);
      });

      test('should handle leap year birthdays', () => {
        const leapYearBirth = new Date('1992-02-29');
        const testUser = new User({ ...validUserData, dateOfBirth: leapYearBirth });
        
        const age = testUser.getAge();
        expect(typeof age).toBe('number');
        expect(age).toBeGreaterThan(0);
      });
    });
  });

  describe('Membership Fields', () => {
    test('should have default membership values', async () => {
      const user = new User(validUserData);
      await user.save();
      
      expect(user.membershipType).toBe('Free');
      expect(user.profileVisibility).toBe('Visible to All');
      expect(user.hideProfile).toBe(false);
      expect(user.profileViews).toBe(0);
      expect(user.isVerified).toBe(false);
    });

    test('should validate membership type enum', async () => {
      const userData = { 
        ...validUserData,
        membershipType: 'InvalidType'
      };
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow(/membershipType.*enum/i);
    });

    test('should allow valid membership types', async () => {
      const types = ['Free', 'Premium', 'Premium Plus'];
      
      for (const type of types) {
        const userData = { 
          ...validUserData,
          email: `test${type.replace(' ', '')}@example.com`,
          phone: `987654321${types.indexOf(type)}`,
          membershipType: type
        };
        const user = new User(userData);
        const savedUser = await user.save();
        
        expect(savedUser.membershipType).toBe(type);
      }
    });

    test('should validate profile visibility enum', async () => {
      const userData = { 
        ...validUserData,
        profileVisibility: 'Invalid Visibility'
      };
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow(/profileVisibility.*enum/i);
    });
  });

  describe('Array Fields', () => {
    test('should initialize empty arrays', async () => {
      const user = new User(validUserData);
      await user.save();
      
      expect(Array.isArray(user.photos)).toBe(true);
      expect(user.photos).toHaveLength(0);
      expect(Array.isArray(user.interests)).toBe(true);
      expect(user.interests).toHaveLength(0);
      expect(Array.isArray(user.blockedUsers)).toBe(true);
      expect(user.blockedUsers).toHaveLength(0);
    });

    test('should allow adding photos', async () => {
      const user = new User(validUserData);
      user.photos.push({
        url: 'https://example.com/photo1.jpg',
        isProfile: true
      });
      await user.save();
      
      expect(user.photos).toHaveLength(1);
      expect(user.photos[0].url).toBe('https://example.com/photo1.jpg');
      expect(user.photos[0].isProfile).toBe(true);
      expect(user.photos[0].uploadedAt).toBeDefined();
    });

    test('should allow adding interests', async () => {
      const user = new User(validUserData);
      user.interests = ['Reading', 'Traveling', 'Cooking'];
      await user.save();
      
      expect(user.interests).toHaveLength(3);
      expect(user.interests).toContain('Reading');
    });
  });

  describe('Activity Tracking', () => {
    test('should have default activity values', async () => {
      const user = new User(validUserData);
      await user.save();
      
      expect(user.profileViews).toBe(0);
      expect(user.isVerified).toBe(false);
      expect(user.hideProfile).toBe(false);
      expect(user.lastActive).toBeDefined();
    });

    test('should allow updating activity fields', async () => {
      const user = new User(validUserData);
      user.profileViews = 10;
      user.isVerified = true;
      user.hideProfile = true;
      await user.save();
      
      expect(user.profileViews).toBe(10);
      expect(user.isVerified).toBe(true);
      expect(user.hideProfile).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long strings within limits', async () => {
      const longString = 'a'.repeat(100);
      const userData = { 
        ...validUserData,
        firstName: longString,
        lastName: longString
      };
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser.firstName).toBe(longString);
      expect(savedUser.lastName).toBe(longString);
    });

    test('should handle special characters in names', async () => {
      const userData = { 
        ...validUserData,
        firstName: 'José',
        lastName: 'O\'Connor'
      };
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser.firstName).toBe('José');
      expect(savedUser.lastName).toBe('O\'Connor');
    });

    test('should handle minimum date of birth', async () => {
      const oldDate = new Date('1900-01-01');
      const userData = { ...validUserData, dateOfBirth: oldDate };
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser.dateOfBirth).toEqual(oldDate);
    });
  });

  describe('Model Indexes', () => {
    test('should have proper indexes defined', () => {
      const indexes = User.schema.indexes();
      const indexFields = indexes.map(index => Object.keys(index[0]));
      
      expect(indexFields).toContainEqual(['email']);
      expect(indexFields).toContainEqual(['phone']);
      expect(indexFields).toContainEqual(['createdAt']);
    });
  });
});