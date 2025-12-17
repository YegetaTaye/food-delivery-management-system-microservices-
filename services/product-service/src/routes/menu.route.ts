import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createMenuItemSchema, updateMenuItemSchema, stockUpdateSchema } from '../validations';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reserveStock,
  releaseStock,
} from '../controllers/menu.controller';

const router = Router();

/**
 * @swagger
 * /menu-items:
 *   get:
 *     tags: [Menu Items]
 *     summary: Get all menu items
 *     description: Retrieve a list of menu items with optional filtering
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         description: Filter by category UUID
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isAvailable
 *         description: Filter by availability status
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 */
router.get('/', getAllMenuItems);

/**
 * @swagger
 * /menu-items/{id}:
 *   get:
 *     tags: [Menu Items]
 *     summary: Get menu item by ID
 *     description: Retrieve a single menu item with its category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Menu item UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Menu item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', getMenuItemById);

/**
 * @swagger
 * /menu-items:
 *   post:
 *     tags: [Menu Items]
 *     summary: Create a new menu item
 *     description: Create a new menu item in a category (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMenuItemRequest'
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticate, validate(createMenuItemSchema), createMenuItem);

/**
 * @swagger
 * /menu-items/{id}:
 *   put:
 *     tags: [Menu Items]
 *     summary: Update a menu item
 *     description: Update an existing menu item (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Menu item UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMenuItemRequest'
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', authenticate, validate(updateMenuItemSchema), updateMenuItem);

/**
 * @swagger
 * /menu-items/{id}:
 *   delete:
 *     tags: [Menu Items]
 *     summary: Delete a menu item
 *     description: Delete a menu item from the system (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Menu item UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Menu item deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', authenticate, deleteMenuItem);

/**
 * @swagger
 * /menu-items/stock/reserve:
 *   post:
 *     tags: [Stock]
 *     summary: Reserve stock for an order
 *     description: Decrease stock quantity for multiple menu items (used when order is placed, requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockOperationRequest'
 *           example:
 *             items:
 *               - menuItemId: "123e4567-e89b-12d3-a456-426614174000"
 *                 quantity: 2
 *               - menuItemId: "123e4567-e89b-12d3-a456-426614174001"
 *                 quantity: 1
 *     responses:
 *       200:
 *         description: Stock reserved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Stock reserved
 *       400:
 *         description: Insufficient stock or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/stock/reserve', authenticate, validate(stockUpdateSchema), reserveStock);

/**
 * @swagger
 * /menu-items/stock/release:
 *   post:
 *     tags: [Stock]
 *     summary: Release reserved stock
 *     description: Increase stock quantity for multiple menu items (used when order is cancelled, requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockOperationRequest'
 *           example:
 *             items:
 *               - menuItemId: "123e4567-e89b-12d3-a456-426614174000"
 *                 quantity: 2
 *               - menuItemId: "123e4567-e89b-12d3-a456-426614174001"
 *                 quantity: 1
 *     responses:
 *       200:
 *         description: Stock released successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Stock released
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/stock/release', authenticate, validate(stockUpdateSchema), releaseStock);

export default router;
