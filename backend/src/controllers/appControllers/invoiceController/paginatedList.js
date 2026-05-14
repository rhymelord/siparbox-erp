const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');
const { getRoleFilter } = require('@/middlewares/dataFilterMiddleware');

const paginatedList = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = page * limit - limit;

    const { filter, equal } = req.query;
    const sortByField = String(req.query.sortBy || 'enabled');
    const sortDirection = req.query.sortValue === '1' ? 'asc' : 'desc';
    const sortObj = {};
    sortObj[sortByField] = sortDirection;

    const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

    let fields;
    fields = fieldsArray.length === 0 ? {} : { $or: [] };

    for (const field of fieldsArray) {
      fields.$or.push({ [field]: { $regex: new RegExp(req.query.q, 'i') } });
    }

    // Build filter condition safely
    let filterCondition = {};
    if (filter && equal !== undefined) {
      filterCondition = { [filter]: equal };
    }

    // Role-based data filtering
    const roleFilter = await getRoleFilter(req.admin);

    //  Query the database for a list of all results
    const resultsPromise = Model.find({
      removed: false,
      ...roleFilter,
      ...filterCondition,
      ...fields,
    })
      .skip(skip)
      .limit(limit)
      .sort(sortObj)
      .populate('createdBy', 'name')
      .exec();

    // Counting the total documents
    const countPromise = Model.countDocuments({
      removed: false,
      ...roleFilter,
      ...filterCondition,
      ...fields,
    });

    // Resolving both promises
    const [result, count] = await Promise.all([resultsPromise, countPromise]);

    // Calculating total pages
    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
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
};

module.exports = paginatedList;
