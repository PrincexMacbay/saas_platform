const sequelize = require('../config/database');
const User = require('./User');
const UserProfile = require('./UserProfile');
const IndividualProfile = require('./IndividualProfile');
const CompanyProfile = require('./CompanyProfile');
const Space = require('./Space');
const Post = require('./Post');
const Comment = require('./Comment');
const Membership = require('./Membership');
const Follow = require('./Follow');
const Like = require('./Like');
const Job = require('./Job');
const JobApplication = require('./JobApplication');
const SavedJob = require('./SavedJob');

// Membership System Models
const Organization = require('./Organization');
const Plan = require('./Plan');
const Subscription = require('./Subscription');
const Payment = require('./Payment');
const Invoice = require('./Invoice');
const ScheduledPayment = require('./ScheduledPayment');
const Debt = require('./Debt');
const Reminder = require('./Reminder');
const Application = require('./Application');
const Coupon = require('./Coupon');
const MembershipSettings = require('./MembershipSettings');
const ApplicationForm = require('./ApplicationForm');
const DigitalCard = require('./DigitalCard');

// Define associations
User.hasMany(Space, { 
  foreignKey: 'ownerId', 
  as: 'ownedSpaces',
  onDelete: 'CASCADE'
});
Space.belongsTo(User, { 
  foreignKey: 'ownerId', 
  as: 'owner'
});

// User-Space membership relationships
User.belongsToMany(Space, { 
  through: Membership, 
  foreignKey: 'userId',
  otherKey: 'spaceId',
  as: 'memberSpaces'
});
Space.belongsToMany(User, { 
  through: Membership, 
  foreignKey: 'spaceId',
  otherKey: 'userId',
  as: 'members'
});

// Direct membership associations
User.hasMany(Membership, { 
  foreignKey: 'userId',
  as: 'memberships',
  onDelete: 'CASCADE'
});
Space.hasMany(Membership, { 
  foreignKey: 'spaceId',
  as: 'memberships',
  onDelete: 'CASCADE'
});
Membership.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'
});
Membership.belongsTo(Space, { 
  foreignKey: 'spaceId',
  as: 'space'
});

// Post relationships
User.hasMany(Post, { 
  foreignKey: 'userId',
  as: 'posts',
  onDelete: 'CASCADE'
});
Post.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'author'
});

Space.hasMany(Post, { 
  foreignKey: 'spaceId',
  as: 'posts',
  onDelete: 'CASCADE'
});
Post.belongsTo(Space, { 
  foreignKey: 'spaceId',
  as: 'space'
});

// Comment relationships
User.hasMany(Comment, { 
  foreignKey: 'userId',
  as: 'comments',
  onDelete: 'CASCADE'
});
Comment.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'author'
});

Post.hasMany(Comment, { 
  foreignKey: 'postId',
  as: 'comments',
  onDelete: 'CASCADE'
});
Comment.belongsTo(Post, { 
  foreignKey: 'postId',
  as: 'post'
});

// Follow relationships - simple associations
User.hasMany(Follow, { 
  foreignKey: 'userId',
  as: 'following',
  onDelete: 'CASCADE'
});
Follow.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'follower'
});

// Like relationships
User.hasMany(Like, { 
  foreignKey: 'userId',
  as: 'likes',
  onDelete: 'CASCADE'
});
Like.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'
});

// Career Center relationships
// Job relationships
User.hasMany(Job, { 
  foreignKey: 'userId',
  as: 'postedJobs',
  onDelete: 'CASCADE'
});
Job.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'employer'
});

// Job Application relationships
User.hasMany(JobApplication, { 
  foreignKey: 'applicantId',
  as: 'jobApplications',
  onDelete: 'CASCADE'
});
JobApplication.belongsTo(User, { 
  foreignKey: 'applicantId',
  as: 'applicant'
});

Job.hasMany(JobApplication, { 
  foreignKey: 'jobId',
  as: 'applications',
  onDelete: 'CASCADE'
});
JobApplication.belongsTo(Job, { 
  foreignKey: 'jobId',
  as: 'job'
});

// Saved Job relationships
User.belongsToMany(Job, { 
  through: SavedJob, 
  foreignKey: 'userId',
  otherKey: 'jobId',
  as: 'savedJobs'
});
Job.belongsToMany(User, { 
  through: SavedJob, 
  foreignKey: 'jobId',
  otherKey: 'userId',
  as: 'savedByUsers'
});

// Direct SavedJob associations for easier querying
SavedJob.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
SavedJob.belongsTo(Job, {
  foreignKey: 'jobId',
  as: 'job'
});

// Membership System Associations

// Organization relationships
User.hasMany(Organization, { 
  foreignKey: 'ownerId', 
  as: 'ownedOrganizations',
  onDelete: 'CASCADE'
});
Organization.belongsTo(User, { 
  foreignKey: 'ownerId', 
  as: 'owner'
});

User.belongsTo(Organization, { 
  foreignKey: 'organizationId', 
  as: 'userOrganization'
});
Organization.hasMany(User, { 
  foreignKey: 'organizationId', 
  as: 'members',
  onDelete: 'SET NULL'
});

Organization.hasMany(Plan, {
  foreignKey: 'organizationId',
  as: 'plans',
  onDelete: 'CASCADE'
});
Plan.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'planOrganization'
});

Organization.hasOne(ApplicationForm, {
  foreignKey: 'organizationId',
  as: 'applicationForm',
  onDelete: 'CASCADE'
});
ApplicationForm.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'formOrganization'
});

// User relationships
User.hasMany(Subscription, { 
  foreignKey: 'userId', 
  as: 'subscriptions',
  onDelete: 'CASCADE'
});
User.hasMany(Payment, { 
  foreignKey: 'userId', 
  as: 'payments',
  onDelete: 'CASCADE'
});
User.hasMany(Invoice, { 
  foreignKey: 'userId', 
  as: 'invoices',
  onDelete: 'CASCADE'
});
User.hasMany(ScheduledPayment, { 
  foreignKey: 'userId', 
  as: 'scheduledPayments',
  onDelete: 'CASCADE'
});
User.hasMany(Debt, { 
  foreignKey: 'userId', 
  as: 'debts',
  onDelete: 'CASCADE'
});
User.hasMany(Reminder, { 
  foreignKey: 'userId', 
  as: 'reminders',
  onDelete: 'CASCADE'
});
User.hasMany(Application, { 
  foreignKey: 'userId', 
  as: 'applications',
  onDelete: 'SET NULL'
});
User.hasMany(DigitalCard, { 
  foreignKey: 'userId', 
  as: 'digitalCards',
  onDelete: 'CASCADE'
});

// Plan relationships
Plan.hasMany(Subscription, { 
  foreignKey: 'planId', 
  as: 'subscriptions',
  onDelete: 'RESTRICT'
});
Plan.hasMany(Payment, { 
  foreignKey: 'planId', 
  as: 'payments',
  onDelete: 'SET NULL'
});
Plan.hasMany(Invoice, { 
  foreignKey: 'planId', 
  as: 'invoices',
  onDelete: 'SET NULL'
});
Plan.hasMany(ScheduledPayment, { 
  foreignKey: 'planId', 
  as: 'scheduledPayments',
  onDelete: 'SET NULL'
});
Plan.hasMany(Debt, { 
  foreignKey: 'planId', 
  as: 'debts',
  onDelete: 'SET NULL'
});
Plan.hasMany(Reminder, { 
  foreignKey: 'planId', 
  as: 'reminders',
  onDelete: 'SET NULL'
});
Plan.hasMany(Application, { 
  foreignKey: 'planId', 
  as: 'applications',
  onDelete: 'RESTRICT'
});

// Subscription relationships
Subscription.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});
Subscription.belongsTo(Plan, { 
  foreignKey: 'planId', 
  as: 'plan'
});
Subscription.hasMany(Payment, { 
  foreignKey: 'subscriptionId', 
  as: 'payments',
  onDelete: 'SET NULL'
});
Subscription.hasMany(ScheduledPayment, { 
  foreignKey: 'subscriptionId', 
  as: 'scheduledPayments',
  onDelete: 'SET NULL'
});
Subscription.hasMany(Debt, { 
  foreignKey: 'subscriptionId', 
  as: 'debts',
  onDelete: 'SET NULL'
});
Subscription.hasMany(Reminder, { 
  foreignKey: 'subscriptionId', 
  as: 'reminders',
  onDelete: 'SET NULL'
});
Subscription.hasMany(DigitalCard, { 
  foreignKey: 'subscriptionId', 
  as: 'digitalCards',
  onDelete: 'CASCADE'
});

// Payment relationships
Payment.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});
Payment.belongsTo(Plan, { 
  foreignKey: 'planId', 
  as: 'plan'
});
Payment.belongsTo(Subscription, { 
  foreignKey: 'subscriptionId', 
  as: 'subscription'
});
Payment.hasOne(Invoice, { 
  foreignKey: 'paymentId', 
  as: 'invoice',
  onDelete: 'SET NULL'
});

// Invoice relationships
Invoice.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});
Invoice.belongsTo(Plan, { 
  foreignKey: 'planId', 
  as: 'plan'
});
Invoice.belongsTo(Payment, { 
  foreignKey: 'paymentId', 
  as: 'payment'
});

// ScheduledPayment relationships
ScheduledPayment.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});
ScheduledPayment.belongsTo(Plan, { 
  foreignKey: 'planId', 
  as: 'plan'
});
ScheduledPayment.belongsTo(Subscription, { 
  foreignKey: 'subscriptionId', 
  as: 'subscription'
});

// Debt relationships
Debt.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});
Debt.belongsTo(Plan, { 
  foreignKey: 'planId', 
  as: 'plan'
});
Debt.belongsTo(Subscription, { 
  foreignKey: 'subscriptionId', 
  as: 'subscription'
});

// Reminder relationships
Reminder.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});
Reminder.belongsTo(Plan, { 
  foreignKey: 'planId', 
  as: 'plan'
});
Reminder.belongsTo(Subscription, { 
  foreignKey: 'subscriptionId', 
  as: 'subscription'
});

// Application relationships
Application.belongsTo(Plan, { 
  foreignKey: 'planId', 
  as: 'plan'
});
Application.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

// Plan-specific relationships
Plan.belongsTo(ApplicationForm, { 
  foreignKey: 'applicationFormId', 
  as: 'applicationForm'
});
Plan.belongsTo(DigitalCard, { 
  foreignKey: 'digitalCardTemplateId', 
  as: 'digitalCardTemplate'
});

// DigitalCard relationships
DigitalCard.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});
DigitalCard.belongsTo(Subscription, { 
  foreignKey: 'subscriptionId', 
  as: 'subscription'
});
DigitalCard.belongsTo(Organization, { 
  foreignKey: 'organizationId', 
  as: 'cardOrganization'
});

// User Profile relationships
User.hasOne(UserProfile, { 
  foreignKey: 'userId', 
  as: 'profile',
  onDelete: 'CASCADE'
});
UserProfile.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

// Individual Profile relationships
User.hasOne(IndividualProfile, { 
  foreignKey: 'userId', 
  as: 'individualProfile',
  onDelete: 'CASCADE'
});
IndividualProfile.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

// Company Profile relationships
User.hasOne(CompanyProfile, { 
  foreignKey: 'userId', 
  as: 'companyProfile',
  onDelete: 'CASCADE'
});
CompanyProfile.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

// Organization relationships for UserProfile
UserProfile.belongsTo(Organization, { 
  foreignKey: 'organizationId', 
  as: 'profileOrganization'
});

module.exports = {
  sequelize,
  User,
  UserProfile,
  IndividualProfile,
  CompanyProfile,
  Space,
  Post,
  Comment,
  Membership,
  Follow,
  Like,
  Job,
  JobApplication,
  SavedJob,
  // Membership System
  Organization,
  Plan,
  Subscription,
  Payment,
  Invoice,
  ScheduledPayment,
  Debt,
  Reminder,
  Application,
  Coupon,
  MembershipSettings,
  ApplicationForm,
  DigitalCard,
};