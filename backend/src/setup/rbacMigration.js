const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

async function runMigration() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Veritabanına bağlanıldı.');

    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');
    
    // 1. Update owner to admin
    const updateResult = await Admin.updateMany({ role: 'owner' }, { $set: { role: 'admin' } });
    console.log(`'owner' rolleri 'admin' olarak güncellendi. Güncellenen kayıt: ${updateResult.modifiedCount}`);
    
    // 2. Check if mudur exists
    let mudur = await Admin.findOne({ email: 'mudur@admin.com' });
    if (!mudur) {
      mudur = await new Admin({
        email: 'mudur@admin.com',
        name: 'Satış',
        surname: 'Müdürü',
        role: 'pazarlamaci_mudur',
        enabled: true,
      }).save();
      
      const { generate: uniqueId } = require('shortid');
      const salt = uniqueId();
      const newAdminPassword = new AdminPassword();
      const passwordHash = newAdminPassword.generateHash(salt, 'mudur123');
      
      await new AdminPassword({
        password: passwordHash,
        emailVerified: true,
        salt: salt,
        user: mudur._id,
      }).save();
      console.log('Müdür hesabı oluşturuldu (mudur@admin.com / mudur123)');
    } else {
      console.log('Müdür hesabı zaten var.');
    }

    // 3. Check if pazarlamaci exists
    let pazarlamaci = await Admin.findOne({ email: 'pazarlamaci@admin.com' });
    if (!pazarlamaci) {
      pazarlamaci = await new Admin({
        email: 'pazarlamaci@admin.com',
        name: 'Normal',
        surname: 'Pazarlamaci',
        role: 'pazarlamaci',
        enabled: true,
        manager: mudur._id
      }).save();
      
      const { generate: uniqueId } = require('shortid');
      const salt = uniqueId();
      const newAdminPassword = new AdminPassword();
      const passwordHash = newAdminPassword.generateHash(salt, 'pazar123');
      
      await new AdminPassword({
        password: passwordHash,
        emailVerified: true,
        salt: salt,
        user: pazarlamaci._id,
      }).save();
      console.log('Pazarlamacı hesabı oluşturuldu (pazarlamaci@admin.com / pazar123)');
    } else {
      console.log('Pazarlamacı hesabı zaten var.');
    }

    console.log('✅ Görev tamamlandı. Çıkış yapılıyor.');
    process.exit(0);
  } catch (error) {
    console.error('Hata oluştu:', error);
    process.exit(1);
  }
}

runMigration();
