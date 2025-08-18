const { 
  Plan, 
  MembershipSettings,
  ApplicationForm,
  Organization,
  User,
  Subscription 
} = require('../models');
const { generateMemberNumber } = require('../utils/memberUtils');

const seedMembershipData = async () => {
  try {
    console.log('🌱 Seeding membership data...');

    // Create default membership settings
    const existingSettings = await MembershipSettings.findOne();
    if (!existingSettings) {
      await MembershipSettings.create({
        autoApproveApplications: false,
        enableApplicationForm: true,
        allowBankTransfers: true,
        invoiceText: 'Thank you for your membership payment.',
        emailNotifications: JSON.stringify({
          newApplication: true,
          paymentReceived: true,
          subscriptionExpiring: true,
          welcomeEmail: true
        }),
        memberNumberPrefix: 'MEM',
        memberNumberLength: 6
      });
      console.log('✅ Created default membership settings');
    }

    // Create default application form
    const existingForm = await ApplicationForm.findOne();
    if (!existingForm) {
      await ApplicationForm.create({
        title: 'Membership Application',
        description: 'Join our community and enjoy exclusive benefits.',
        footer: 'We appreciate your interest in becoming a member.',
        terms: 'By submitting this application, you agree to our terms and conditions.',
        agreement: 'I agree to the terms and conditions and wish to become a member.',
        fields: JSON.stringify([
          {
            name: 'referral',
            label: 'How did you hear about us?',
            type: 'select',
            required: false,
            options: ['Website', 'Friend', 'Social Media', 'Advertisement', 'Other']
          },
          {
            name: 'interests',
            label: 'Areas of Interest',
            type: 'checkbox',
            required: false,
            options: ['Networking', 'Professional Development', 'Social Events', 'Education']
          }
        ]),
        isPublished: true
      });
      console.log('✅ Created default application form');
    }

    // Create sample organizations (find or create admin users first)
    let adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      // Create a sample admin user if none exists
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        status: 1,
        organizationRole: 'admin'
      });
      console.log('✅ Created sample admin user');
    }

    const existingOrgs = await Organization.count();
    if (existingOrgs === 0) {
      const sampleOrgs = [
        {
          name: 'Tech Innovators Hub',
          description: 'A community for technology enthusiasts, developers, and innovators.',
          website: 'https://techinnovators.example.com',
          email: 'contact@techinnovators.example.com',
          ownerId: adminUser.id
        },
        {
          name: 'Creative Professionals Network',
          description: 'Connecting designers, artists, and creative professionals worldwide.',
          website: 'https://creativepro.example.com',
          email: 'hello@creativepro.example.com',
          ownerId: adminUser.id
        }
      ];

      for (const orgData of sampleOrgs) {
        await Organization.create(orgData);
        console.log(`✅ Created organization: ${orgData.name}`);
      }
    }

    // Create sample membership plans
    const existingPlans = await Plan.count();
    if (existingPlans === 0) {
      const organizations = await Organization.findAll();
      const org1 = organizations[0];
      const org2 = organizations[1];
      const plans = [
        {
          name: 'Developer Membership',
          description: 'Access to tech talks, coding workshops, and networking events.',
          fee: 49.99,
          renewalInterval: 'monthly',
          benefits: JSON.stringify([
            'Weekly tech talks and workshops',
            'Access to coding bootcamps',
            'Mentorship program',
            'Job board access',
            'GitHub Pro account'
          ]),
          isActive: true,
          isPublic: true,
          organizationId: org1?.id
        },
        {
          name: 'Senior Developer',
          description: 'Premium membership for experienced developers and tech leads.',
          fee: 99.99,
          renewalInterval: 'monthly',
          benefits: JSON.stringify([
            'All Developer benefits',
            'Leadership workshops',
            'Executive networking events',
            'Priority support',
            'Annual tech conference tickets'
          ]),
          isActive: true,
          isPublic: true,
          organizationId: org1?.id
        },
        {
          name: 'Creative Basic',
          description: 'Essential membership for creative professionals.',
          fee: 39.99,
          renewalInterval: 'monthly',
          benefits: JSON.stringify([
            'Portfolio reviews',
            'Creative workshops',
            'Industry networking',
            'Resource library access'
          ]),
          isActive: true,
          isPublic: true,
          organizationId: org2?.id
        },
        {
          name: 'Creative Pro',
          description: 'Advanced membership with premium creative resources.',
          fee: 79.99,
          renewalInterval: 'monthly',
          benefits: JSON.stringify([
            'All Creative Basic benefits',
            'One-on-one mentoring',
            'Premium software licenses',
            'Gallery showcase opportunities',
            'Client referral program'
          ]),
          isActive: true,
          isPublic: true,
          organizationId: org2?.id,
          maxMembers: 50
        },
        {
          name: 'Student Developer',
          description: 'Discounted membership for students pursuing tech careers.',
          fee: 19.99,
          renewalInterval: 'monthly',
          benefits: JSON.stringify([
            'Student-focused workshops',
            'Career guidance sessions',
            'Internship opportunities',
            'Study group access'
          ]),
          isActive: true,
          isPublic: true,
          organizationId: org1?.id,
          maxMembers: 100
        }
      ];

      for (const planData of plans) {
        await Plan.create(planData);
        console.log(`✅ Created plan: ${planData.name}`);
      }
    }

    // Create sample subscriptions for the admin user
    const existingSubscriptions = await Subscription.count();
    if (existingSubscriptions === 0) {
      const plans = await Plan.findAll();
      if (plans.length > 0 && adminUser) {
        // Create a sample subscription for the admin user
        const sampleSubscription = await Subscription.create({
          userId: adminUser.id,
          planId: plans[0].id, // Developer Membership plan
          memberNumber: await generateMemberNumber(),
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        });
        console.log('✅ Created sample subscription for admin user');
      }
    }

    console.log('🎉 Membership seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding membership data:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedMembershipData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedMembershipData };
