const router = require('express').Router();
const { updateColumn, deleteColumn } = require('../controllers/columnController');

router.route('/:columnId').patch(updateColumn).delete(deleteColumn);

module.exports = router;
