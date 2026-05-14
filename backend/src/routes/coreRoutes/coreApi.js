const express = require('express');

const { catchErrors } = require('@/handlers/errorHandlers');

const router = express.Router();

const adminController = require('@/controllers/coreControllers/adminController');
const settingController = require('@/controllers/coreControllers/settingController');
const auditLogController = require('@/controllers/coreControllers/auditLogController');

const { singleStorageUpload } = require('@/middlewares/uploadMiddleware');
const { requireRole } = require('@/middlewares/roleMiddleware');

const adminOnly = requireRole('admin');

// //_______________________________ Audit Logs _______________________________

router.route('/auditlog/list').get(adminOnly, catchErrors(auditLogController.list));
router.route('/auditlog/read/:id').get(adminOnly, catchErrors(auditLogController.read));

// //_______________________________ Admin management_______________________________

router.route('/admin/read/:id').get(catchErrors(adminController.read));

router.route('/admin/password-update/:id').patch(catchErrors(adminController.updatePassword));

//_______________________________ Admin Profile _______________________________

router.route('/admin/profile/password').patch(catchErrors(adminController.updateProfilePassword));
router
  .route('/admin/profile/update')
  .patch(
    singleStorageUpload({ entity: 'admin', fieldName: 'photo', fileType: 'image' }),
    catchErrors(adminController.updateProfile)
  );

// //____________________________________________ API for Global Setting _________________

router.route('/setting/create').post(adminOnly, catchErrors(settingController.create));
router.route('/setting/read/:id').get(catchErrors(settingController.read));
router.route('/setting/update/:id').patch(adminOnly, catchErrors(settingController.update));
//router.route('/setting/delete/:id).delete(adminOnly, catchErrors(settingController.delete));
router.route('/setting/search').get(catchErrors(settingController.search));
router.route('/setting/list').get(catchErrors(settingController.list));
router.route('/setting/listAll').get(catchErrors(settingController.listAll));
router.route('/setting/filter').get(catchErrors(settingController.filter));
router
  .route('/setting/readBySettingKey/:settingKey')
  .get(catchErrors(settingController.readBySettingKey));
router.route('/setting/listBySettingKey').get(catchErrors(settingController.listBySettingKey));
router
  .route('/setting/updateBySettingKey/:settingKey?')
  .patch(adminOnly, catchErrors(settingController.updateBySettingKey));
router
  .route('/setting/upload/:settingKey?')
  .patch(
    adminOnly,
    singleStorageUpload({ entity: 'setting', fieldName: 'settingValue', fileType: 'image' }),
    catchErrors(settingController.updateBySettingKey)
  );
router.route('/setting/updateManySetting').patch(adminOnly, catchErrors(settingController.updateManySetting));
module.exports = router;
