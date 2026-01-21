import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DeliveryStatus:
 *       type: string
 *       enum: [ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED]
 *       description: Current status of the delivery
 *     Delivery:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique delivery identifier
 *         orderId:
 *           type: string
 *           description: Associated order ID
 *         status:
 *           $ref: '#/components/schemas/DeliveryStatus'
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           description: When the delivery was assigned
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the delivery was last updated
 *     DeliveryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/Delivery'
 *     DeliveryListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Delivery'
 *         count:
 *           type: integer
 *     UpdateStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [IN_TRANSIT, DELIVERED, CANCELLED]
 *           description: New status for the delivery
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   - name: Deliveries
 *     description: Delivery management endpoints
 */

/**
 * @swagger
 * /api/v1/deliveries:
 *   get:
 *     summary: Get all deliveries
 *     description: Retrieve a list of all deliveries (limited to 100 most recent)
 *     tags: [Deliveries]
 *     responses:
 *       200:
 *         description: List of deliveries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryListResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', deliveryController.getAllDeliveries.bind(deliveryController));

/**
 * @swagger
 * /api/v1/deliveries/{orderId}:
 *   get:
 *     summary: Get delivery by order ID
 *     description: Retrieve delivery information for a specific order
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Delivery information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryResponse'
 *       404:
 *         description: Delivery not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:orderId', deliveryController.getDeliveryByOrderId.bind(deliveryController));

/**
 * @swagger
 * /api/v1/deliveries/{orderId}/status:
 *   patch:
 *     summary: Update delivery status
 *     description: Update the status of a delivery. Valid transitions are ASSIGNED -> IN_TRANSIT -> DELIVERED. CANCELLED is a terminal state reachable from ASSIGNED or IN_TRANSIT.
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatusRequest'
 *           examples:
 *             inTransit:
 *               summary: Mark as in transit
 *               value:
 *                 status: IN_TRANSIT
 *             delivered:
 *               summary: Mark as delivered
 *               value:
 *                 status: DELIVERED
 *     responses:
 *       200:
 *         description: Delivery status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Delivery'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid status or transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Delivery not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:orderId/status', deliveryController.updateDeliveryStatus.bind(deliveryController));

export default router;

