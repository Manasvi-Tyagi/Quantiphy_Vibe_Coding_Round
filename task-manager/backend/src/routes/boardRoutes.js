const router = require('express').Router();
const boardController = require('../controllers/boardController');
const columnController = require('../controllers/columnController');
const taskController = require('../controllers/taskController');

router.route('/').get(boardController.getBoards).post(boardController.createBoard);
router.route('/:boardId').get(boardController.getBoard).patch(boardController.updateBoard).delete(boardController.deleteBoard);
router.post('/:boardId/columns', columnController.createColumn);
router.post('/:projectId/tasks', taskController.createTask);
router.post('/:projectId/tasks/existing', taskController.addExistingTask);

module.exports = router;
