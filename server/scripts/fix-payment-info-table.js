const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false
  }
);

async function fixPaymentInfoTable() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Drop the existing table if it exists
    console.log('Dropping existing user_payment_info table...');
    await sequelize.query('DROP TABLE IF EXISTS "user_payment_info" CASCADE;');
    console.log('Table dropped successfully.');

    // Drop the ENUM types if they exist
    console.log('Dropping ENUM types...');
    try {
      await sequelize.query('DROP TYPE IF EXISTS "enum_user_payment_info_accountType" CASCADE;');
      await sequelize.query('DROP TYPE IF EXISTS "enum_user_payment_info_paymentGateway" CASCADE;');
      console.log('ENUM types dropped successfully.');
    } catch (error) {
      console.log('ENUM types already dropped or never existed.');
    }

    console.log('Table structure fixed. You can now restart your server.');
    
  } catch (error) {
    console.error('Error fixing table:', error);
  } finally {
    await sequelize.close();
  }
}

fixPaymentInfoTable();
