/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task management and operations
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *         userId:
 *           type: string
 *           example: 60d0fe4f5311236168a109cb
 *         title:
 *           type: string
 *           example: "Complete documentation"
 *         description:
 *           type: string
 *           example: "Finish the API documentation by tomorrow"
 *         completed:
 *           type: boolean
 *           example: false
 *         verified:
 *           type: boolean
 *           example: false
 *         rejectMessage:
 *           type: string
 *           example: "Please fix the formatting."
 *         notification:
 *           type: boolean
 *           example: true
 *         picture:
 *           type: string
 *           example: "http://example.com/image.png"
 *         completedDate:
 *           type: string
 *           description: Date when the task was marked completed in format YYYYMMDDHHmmss
 *           example: "20240627123045"
 *
 * /tasks/stats:
 *   get:
 *     summary: Get task statistics (admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalTasks:
 *                   type: integer
 *                   example: 100
 *                 totalCompletedTasks:
 *                   type: integer
 *                   example: 45
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - not admin role
 *
 * /tasks:
 *   get:
 *     summary: Get list of tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter tasks by user ID (admin or allowed user only)
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tasks per page
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 45
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Task to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Complete report"
 *               description:
 *                 type: string
 *                 example: "Finish the annual report"
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Tarefa criada com sucesso!"
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad Request - missing fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - no partner assigned
 *
 * /tasks/{id}:
 *   put:
 *     summary: Update a task (admin only, only if not completed)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Task fields to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated task title"
 *               description:
 *                 type: string
 *                 example: "Updated task description"
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Tarefa atualizada com sucesso."
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - no permission or task completed
 *       404:
 *         description: Task not found
 *
 *   delete:
 *     summary: Delete a task (admin only, only if not verified)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Tarefa apagada com sucesso."
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - task verified or no permission
 *       404:
 *         description: Task not found
 *
 * /tasks/{id}/complete:
 *   patch:
 *     summary: Mark task as completed
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Optional picture to attach when completing
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               picture:
 *                 type: string
 *                 format: uri
 *                 example: "http://example.com/completed_task.jpg"
 *     responses:
 *       200:
 *         description: Task marked as completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Tarefa marcada como concluída com sucesso!"
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - task not owned by user
 *       404:
 *         description: Task not found
 *
 * /tasks/{id}/verify:
 *   patch:
 *     summary: Verify or reject a task (partner user)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Verification data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verify:
 *                 type: boolean
 *                 description: true to verify/accept, false to reject
 *               rejectMessage:
 *                 type: string
 *                 description: Reason for rejection (required if verify is false)
 *     responses:
 *       200:
 *         description: Task verification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Tarefa verificada com sucesso!"
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not allowed to verify task
 *       404:
 *         description: Task not found
 *
 * /tasks/{id}/remove-reject-message:
 *   patch:
 *     summary: Remove rejection message from a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rejection message removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Mensagem removida com sucesso!"
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - no permission to modify this task
 *       404:
 *         description: Task not found
 *
 * /tasks/{id}/notification:
 *   patch:
 *     summary: Remove notification flag from a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification removed successfully
 *
 */

const express = require("express");
const router = express.Router();

const tasksController = require("../controllers/tasks.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const diffSeconds = (Date.now() - start) / 1000;
    console.log(
      `${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`
    );
  });
  next();
});

router.get("/stats", authMiddleware, tasksController.getTasksStats);

router
  .route("/")
  .get(authMiddleware, tasksController.getTasks)
  .post(authMiddleware, tasksController.createTask);

router
  .route("/:id")
  .delete(authMiddleware, tasksController.deleteTasks)
  .put(authMiddleware, tasksController.editTasks);

router
  .route("/:id/complete")
  .patch(authMiddleware, tasksController.completeTask);

router.route("/:id/verify").patch(authMiddleware, tasksController.verifyTask);

router
  .route("/:id/remove-reject-message")
  .patch(authMiddleware, tasksController.removeRejectMessage);

router
  .route("/:id/notification")
  .patch(authMiddleware, tasksController.notifyTasks);

module.exports = router;
