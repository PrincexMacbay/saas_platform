const { sequelize } = require('../models');

async function addUserPaymentInfoTable() {
  try {
    console.log('Starting migration: Adding user_payment_info table...');
    
    // Create the user_payment_info table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_payment_info (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "bankName" VARCHAR(255),
        "accountNumber" VARCHAR(50),
        "routingNumber" VARCHAR(20),
        "accountHolderName" VARCHAR(255),
        "accountType" VARCHAR(20) CHECK ("accountType" IN ('checking', 'savings', 'business')),
        "preferredCrypto" VARCHAR(20) DEFAULT 'BTC',
        "btcAddress" VARCHAR(255),
        "ethAddress" VARCHAR(255),
        "ltcAddress" VARCHAR(255),
        "bchAddress" VARCHAR(255),
        "xmrAddress" VARCHAR(255),
        "paymentGateway" VARCHAR(20) NOT NULL DEFAULT 'nowpayments' CHECK ("paymentGateway" IN ('nowpayments', 'btcpay', 'manual')),
        "gatewayApiKey" VARCHAR(255),
        "gatewayStoreId" VARCHAR(100),
        "isActive" BOOLEAN DEFAULT true,
        "autoAcceptPayments" BOOLEAN DEFAULT true,
        "minimumPaymentAmount" DECIMAL(10,2) DEFAULT 0.01,
        "paymentInstructions" TEXT,
        "taxId" VARCHAR(50),
        "businessName" VARCHAR(255),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        CONSTRAINT fk_user_payment_info_user
          FOREIGN KEY ("userId")
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);

    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_payment_info_user_id ON user_payment_info("userId");
      CREATE INDEX IF NOT EXISTS idx_user_payment_info_gateway ON user_payment_info("paymentGateway");
      CREATE INDEX IF NOT EXISTS idx_user_payment_info_active ON user_payment_info("isActive");
    `);

    console.log('✅ Migration completed successfully!');
    console.log('✅ user_payment_info table created with all necessary fields and indexes');
    console.log('✅ Foreign key constraint added to users table');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addUserPaymentInfoTable()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = addUserPaymentInfoTable;
