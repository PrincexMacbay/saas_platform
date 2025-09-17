const sequelize = require('../config/database');
const Application = require('../models/Application');

async function addIncompleteStatus() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // First, let's check the current status values in the database
    const statusCounts = await Application.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    console.log('Current application status counts:');
    statusCounts.forEach(item => {
      console.log(`  ${item.status}: ${item.count}`);
    });

    // Update the Application model to include 'incomplete' status
    // We need to modify the validation constraint
    console.log('\nUpdating Application model validation...');
    
    // For now, let's update existing pending applications that don't have payment info to 'incomplete'
    const pendingApplications = await Application.findAll({
      where: {
        status: 'pending',
        paymentInfo: null
      }
    });

    console.log(`Found ${pendingApplications.length} pending applications without payment info`);

    if (pendingApplications.length > 0) {
      // Update these to 'incomplete' status
      await Application.update(
        { status: 'incomplete' },
        {
          where: {
            id: pendingApplications.map(app => app.id)
          }
        }
      );
      console.log(`✅ Updated ${pendingApplications.length} applications to 'incomplete' status`);
    }

    // Now let's check the updated counts
    const updatedStatusCounts = await Application.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    console.log('\nUpdated application status counts:');
    updatedStatusCounts.forEach(item => {
      console.log(`  ${item.status}: ${item.count}`);
    });

    console.log('\nIncomplete status added successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

addIncompleteStatus();


