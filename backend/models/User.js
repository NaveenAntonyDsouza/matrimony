const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  profileCreatedFor: {
    type: String,
    enum: ['Self', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Relative'],
    required: true
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  maritalStatus: {
    type: String,
    enum: ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'],
    required: true
  },
  motherTongue: {
    type: String,
    required: true
  },
  religion: {
    type: String,
    required: true
  },
  caste: {
    type: String
  },
  subCaste: {
    type: String
  },
  height: {
    type: String,
    required: true
  },
  weight: {
    type: String
  },
  bodyType: {
    type: String,
    enum: ['Slim', 'Average', 'Athletic', 'Heavy']
  },
  complexion: {
    type: String,
    enum: ['Very Fair', 'Fair', 'Wheatish', 'Wheatish Brown', 'Dark']
  },
  physicalStatus: {
    type: String,
    enum: ['Normal', 'Physically Challenged'],
    default: 'Normal'
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Don\'t Know']
  },
  
  // Location Information
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  residenceStatus: {
    type: String,
    enum: ['Citizen', 'Permanent Resident', 'Work Permit', 'Student Visa', 'Temporary Visa']
  },
  
  // Education & Career
  education: {
    type: String,
    required: true
  },
  educationDetail: {
    type: String
  },
  occupation: {
    type: String,
    required: true
  },
  occupationDetail: {
    type: String
  },
  employedIn: {
    type: String,
    enum: ['Government', 'Private', 'Business', 'Defense', 'Self Employed', 'Not Working']
  },
  annualIncome: {
    type: String,
    enum: ['Rs. 0 - 1 Lakh', 'Rs. 1 - 2 Lakh', 'Rs. 2 - 3 Lakh', 'Rs. 3 - 4 Lakh', 'Rs. 4 - 5 Lakh', 'Rs. 5 - 7.5 Lakh', 'Rs. 7.5 - 10 Lakh', 'Rs. 10 - 15 Lakh', 'Rs. 15 - 20 Lakh', 'Rs. 20 - 25 Lakh', 'Rs. 25 - 35 Lakh', 'Rs. 35 - 50 Lakh', 'Rs. 50 - 75 Lakh', 'Rs. 75 Lakh - 1 Crore', 'Rs. 1 Crore & Above']
  },
  
  // Family Information
  familyStatus: {
    type: String,
    enum: ['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent']
  },
  familyType: {
    type: String,
    enum: ['Joint Family', 'Nuclear Family']
  },
  familyValues: {
    type: String,
    enum: ['Orthodox', 'Traditional', 'Moderate', 'Liberal']
  },
  fatherOccupation: {
    type: String
  },
  motherOccupation: {
    type: String
  },
  brothers: {
    type: Number,
    default: 0
  },
  brothersMarried: {
    type: Number,
    default: 0
  },
  sisters: {
    type: Number,
    default: 0
  },
  sistersMarried: {
    type: Number,
    default: 0
  },
  
  // Lifestyle & Interests
  drinkingHabits: {
    type: String,
    enum: ['No', 'Yes', 'Occasionally']
  },
  smokingHabits: {
    type: String,
    enum: ['No', 'Yes', 'Occasionally']
  },
  eatingHabits: {
    type: String,
    enum: ['Veg', 'Non-Veg', 'Eggetarian', 'Jain', 'Vegan']
  },
  hobbies: [{
    type: String
  }],
  interests: [{
    type: String
  }],
  sports: [{
    type: String
  }],
  
  // About & Bio
  aboutMe: {
    type: String,
    maxlength: 4000
  },
  
  // Photos
  photos: [{
    url: String,
    isProfile: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Partner Preferences
  partnerPreferences: {
    ageFrom: {
      type: Number,
      min: 18,
      max: 80
    },
    ageTo: {
      type: Number,
      min: 18,
      max: 80
    },
    heightFrom: String,
    heightTo: String,
    maritalStatus: [{
      type: String,
      enum: ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce']
    }],
    motherTongue: [String],
    religion: [String],
    caste: [String],
    education: [String],
    occupation: [String],
    annualIncomeFrom: String,
    annualIncomeTo: String,
    country: [String],
    state: [String],
    city: [String],
    manglik: String,
    drinkingHabits: [String],
    smokingHabits: [String],
    eatingHabits: [String],
    aboutPartner: {
      type: String,
      maxlength: 4000
    }
  },
  
  // Membership & Privacy
  membershipType: {
    type: String,
    enum: ['Free', 'Premium', 'Premium Plus'],
    default: 'Free'
  },
  membershipExpiry: {
    type: Date
  },
  profileVisibility: {
    type: String,
    enum: ['Visible to All', 'Visible to Premium Members Only', 'Hidden'],
    default: 'Visible to All'
  },
  photoPassword: {
    type: String
  },
  hideProfile: {
    type: Boolean,
    default: false
  },
  
  // Activity & Tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  profileViews: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    url: String,
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending'
    }
  }],
  
  // Contact Information
  contactExchanged: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    exchangedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Blocking & Reporting
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get age
userSchema.methods.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Index for search optimization
userSchema.index({ gender: 1, maritalStatus: 1, religion: 1, caste: 1, city: 1, state: 1, country: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);