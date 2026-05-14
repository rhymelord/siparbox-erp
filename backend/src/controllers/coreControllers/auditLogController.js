const mongoose = require('mongoose');
const Model = mongoose.model('AuditLog');

const auditLogController = {
  list: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = parseInt(req.query.items) || 10;
      const skip = page * limit - limit;

      const sortByField = String(req.query.sortBy || 'createdAt');
      const sortDirection = req.query.sortValue === '1' ? 'asc' : 'desc';
      const sortObj = {};
      sortObj[sortByField] = sortDirection;

      const resultsPromise = Model.find()
        .skip(skip)
        .limit(limit)
        .sort(sortObj)
        .populate('user', 'name surname email')
        .exec();

      const countPromise = Model.countDocuments();

      const [result, count] = await Promise.all([resultsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      const pagination = { page, pages, count };

      if (count > 0) {
        return res.status(200).json({
          success: true,
          result,
          pagination,
          message: 'Successfully found all documents',
        });
      } else {
        return res.status(203).json({
          success: true,
          result: [],
          pagination,
          message: 'Collection is Empty',
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        result: null,
        message: err.message,
      });
    }
  },

  read: async (req, res) => {
    try {
      const result = await Model.findOne({ _id: req.params.id })
        .populate('user', 'name surname email')
        .exec();
      
      if (!result) {
        return res.status(404).json({
          success: false,
          result: null,
          message: 'No document found by this id: ' + req.params.id,
        });
      }

      return res.status(200).json({
        success: true,
        result,
        message: 'we found this document by this id: ' + req.params.id,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        result: null,
        message: err.message,
      });
    }
  }
};

module.exports = auditLogController;
