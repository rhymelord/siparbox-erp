require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

const fs = require('fs');
const { globSync } = require('glob');
const { generate: uniqueId } = require('shortid');
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE);

async function setupApp() {
  let exitCode = 0;

  try {
    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');
    const Setting = require('../models/coreModels/Setting');
    const PaymentMode = require('../models/appModels/PaymentMode');
    const Taxes = require('../models/appModels/Taxes');

    let admin = await Admin.findOne({ email: 'admin@admin.com', removed: false });

    if (!admin) {
      admin = await new Admin({
        email: 'admin@admin.com',
        name: 'SiparBox',
        surname: 'Admin',
        enabled: true,
        role: 'owner',
      }).save();
      console.log('Admin created: done');
    } else {
      console.log('Admin already exists: skipped');
    }

    const existingPassword = await AdminPassword.findOne({ user: admin._id, removed: false });
    if (!existingPassword) {
      const passwordModel = new AdminPassword();
      const salt = uniqueId();
      const passwordHash = passwordModel.generateHash(salt, 'admin123');

      await new AdminPassword({
        password: passwordHash,
        emailVerified: true,
        salt,
        user: admin._id,
      }).save();
      console.log('Admin password created: done');
    } else {
      console.log('Admin password already exists: skipped');
    }

    const settingFiles = [];
    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      settingFiles.push(...file);
    }

    if (settingFiles.length) {
      await Setting.bulkWrite(
        settingFiles.map((setting) => ({
          updateOne: {
            filter: { settingKey: setting.settingKey },
            update: { $setOnInsert: setting },
            upsert: true,
          },
        })),
        { ordered: false }
      );
    }
    console.log('Settings ensured: done');

    await Taxes.updateOne(
      { taxName: 'Tax 0%', removed: false },
      {
        $setOnInsert: {
          taxName: 'Tax 0%',
          taxValue: 0,
          isDefault: true,
        },
      },
      { upsert: true }
    );
    console.log('Taxes ensured: done');

    await PaymentMode.updateOne(
      { name: 'Default Payment', removed: false },
      {
        $setOnInsert: {
          name: 'Default Payment',
          description: 'Default Payment Mode (Cash, Wire Transfer)',
          isDefault: true,
        },
      },
      { upsert: true }
    );
    console.log('Payment modes ensured: done');

    console.log('Setup completed: success');
  } catch (error) {
    exitCode = 1;
    console.log('\nError! The error info is below');
    console.log(error);
  } finally {
    await mongoose.disconnect();
    process.exit(exitCode);
  }
}

setupApp();
