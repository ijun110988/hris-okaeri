const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Branch management endpoints
 */

/**
 * @swagger
 * /api/branches:
 *   get:
 *     summary: Get all branches
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all branches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Branch'
 *             example:
 *               status: success
 *               data: [
 *                 {
 *                   id: 1,
 *                   name: "Kantor Pusat Jakarta",
 *                   code: "OKE001",
 *                   address: "Gedung Menara Palma Lt. 5, Jl. HR Rasuna Said Kav. 6, Kuningan, Jakarta Selatan",
 *                   phoneNumber: "021-5795-8000",
 *                   email: "jakarta.hq@okaeri.id",
 *                   latitude: -6.2088,
 *                   longitude: 106.8456,
 *                   isActive: true,
 *                   createdAt: "2024-01-20T08:30:00.000Z",
 *                   updatedAt: "2024-01-20T08:30:00.000Z"
 *                 },
 *                 {
 *                   id: 2,
 *                   name: "Kantor Cabang Surabaya",
 *                   code: "OKE002",
 *                   address: "Gedung Intiland Lt. 3, Jl. Panglima Sudirman No. 101-103, Surabaya",
 *                   phoneNumber: "031-5475-9000",
 *                   email: "surabaya@okaeri.id",
 *                   latitude: -7.2575,
 *                   longitude: 112.7521,
 *                   isActive: true,
 *                   createdAt: "2024-01-20T08:30:00.000Z",
 *                   updatedAt: "2024-01-20T08:30:00.000Z"
 *                 }
 *               ]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticateToken, branchController.getAllBranches);

/**
 * @swagger
 * /api/branches/{id}:
 *   get:
 *     summary: Get branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Branch details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "Kantor Pusat Jakarta"
 *                 code: "OKE001"
 *                 address: "Gedung Menara Palma Lt. 5, Jl. HR Rasuna Said Kav. 6, Kuningan, Jakarta Selatan"
 *                 phoneNumber: "021-5795-8000"
 *                 email: "jakarta.hq@okaeri.id"
 *                 latitude: -6.2088
 *                 longitude: 106.8456
 *                 isActive: true
 *                 createdAt: "2024-01-20T08:30:00.000Z"
 *                 updatedAt: "2024-01-20T08:30:00.000Z"
 *       404:
 *         description: Branch not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: error
 *               message: Branch not found
 */
router.get('/:id', authenticateToken, branchController.getBranchById);

/**
 * @swagger
 * /api/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Branch name
 *                 minLength: 1
 *                 example: "Kantor Pusat Jakarta"
 *               address:
 *                 type: string
 *                 description: Complete branch address
 *                 example: "Gedung Menara Palma Lt. 5, Jl. HR Rasuna Said Kav. 6, Kuningan, Jakarta Selatan"
 *               phoneNumber:
 *                 type: string
 *                 description: Branch contact number with area code
 *                 example: "021-5795-8000"
 *               email:
 *                 type: string
 *                 description: Official branch email address
 *                 format: email
 *                 example: "jakarta.hq@okaeri.id"
 *               latitude:
 *                 type: number
 *                 format: decimal
 *                 description: Branch latitude coordinate (South is negative)
 *                 minimum: -90
 *                 maximum: 90
 *                 example: -6.2088
 *               longitude:
 *                 type: number
 *                 format: decimal
 *                 description: Branch longitude coordinate (West is negative)
 *                 minimum: -180
 *                 maximum: 180
 *                 example: 106.8456
 *           example:
 *             name: "Kantor Pusat Jakarta"
 *             address: "Gedung Menara Palma Lt. 5, Jl. HR Rasuna Said Kav. 6, Kuningan, Jakarta Selatan"
 *             phoneNumber: "021-5795-8000"
 *             email: "jakarta.hq@okaeri.id"
 *             latitude: -6.2088
 *             longitude: 106.8456
 *     responses:
 *       201:
 *         description: Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "Kantor Pusat Jakarta"
 *                 code: "OKE001"
 *                 address: "Gedung Menara Palma Lt. 5, Jl. HR Rasuna Said Kav. 6, Kuningan, Jakarta Selatan"
 *                 phoneNumber: "021-5795-8000"
 *                 email: "jakarta.hq@okaeri.id"
 *                 latitude: -6.2088
 *                 longitude: 106.8456
 *                 isActive: true
 *                 createdAt: "2024-01-20T08:30:00.000Z"
 *                 updatedAt: "2024-01-20T08:30:00.000Z"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: error
 *               message: Invalid latitude value. Must be between -90 and 90
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: error
 *               message: Unauthorized access
 */
router.post('/', authenticateToken, branchController.createBranch);

/**
 * @swagger
 * /api/branches/{id}:
 *   put:
 *     summary: Update a branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Branch name
 *                 minLength: 1
 *                 example: "Kantor Pusat Jakarta"
 *               address:
 *                 type: string
 *                 description: Complete branch address
 *                 example: "Gedung Menara Palma Lt. 5, Jl. HR Rasuna Said Kav. 6, Kuningan, Jakarta Selatan"
 *               phoneNumber:
 *                 type: string
 *                 description: Branch contact number with area code
 *                 example: "021-5795-8000"
 *               email:
 *                 type: string
 *                 description: Official branch email address
 *                 format: email
 *                 example: "jakarta.hq@okaeri.id"
 *               latitude:
 *                 type: number
 *                 format: decimal
 *                 description: Branch latitude coordinate (South is negative)
 *                 minimum: -90
 *                 maximum: 90
 *                 example: -6.2088
 *               longitude:
 *                 type: number
 *                 format: decimal
 *                 description: Branch longitude coordinate (West is negative)
 *                 minimum: -180
 *                 maximum: 180
 *                 example: 106.8456
 *               isActive:
 *                 type: boolean
 *                 description: Branch operational status
 *                 example: true
 *           example:
 *             name: "Kantor Pusat Jakarta"
 *             address: "Gedung Menara Palma Lt. 5, Jl. HR Rasuna Said Kav. 6, Kuningan, Jakarta Selatan"
 *             phoneNumber: "021-5795-8000"
 *             email: "jakarta.hq@okaeri.id"
 *             latitude: -6.2088
 *             longitude: 106.8456
 *             isActive: true
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "Kantor Pusat Jakarta"
 *                 code: "OKE001"
 *                 address: "Gedung Menara Palma Lt. 5, Jl. HR Rasuna Said Kav. 6, Kuningan, Jakarta Selatan"
 *                 phoneNumber: "021-5795-8000"
 *                 email: "jakarta.hq@okaeri.id"
 *                 latitude: -6.2088
 *                 longitude: 106.8456
 *                 isActive: true
 *                 createdAt: "2024-01-20T08:30:00.000Z"
 *                 updatedAt: "2024-01-20T08:30:00.000Z"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: error
 *               message: Invalid longitude value. Must be between -180 and 180
 *       404:
 *         description: Branch not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: error
 *               message: Branch not found
 */
router.put('/:id', authenticateToken, branchController.updateBranch);

/**
 * @swagger
 * /api/branches/{id}:
 *   delete:
 *     summary: Delete a branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Branch deleted successfully
 *             example:
 *               status: success
 *               message: Branch deleted successfully
 *       404:
 *         description: Branch not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: error
 *               message: Branch not found
 */
router.delete('/:id', authenticateToken, branchController.deleteBranch);

module.exports = router;
