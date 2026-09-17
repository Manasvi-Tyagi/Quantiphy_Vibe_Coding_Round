const router = require('express').Router();
const { createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.route('/').post(createTask);
router.route('/:taskId').patch(updateTask).delete(deleteTask);

module.exports = router;
