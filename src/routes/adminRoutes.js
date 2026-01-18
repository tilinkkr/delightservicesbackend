import express from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { getStats } from '../controllers/dashboardController.js';
import { getOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js';
import { createProduct, updateProduct, getProducts, archiveProduct } from '../controllers/productController.js';
import { getCustomers, getCustomerById, toggleVIP } from '../controllers/customerController.js';
import { getInquiries, getInquiryById, replyToInquiry, updateInquiryStatus } from '../controllers/inquiryController.js';

import { getAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/ping', (req, res) => res.send('Admin Routes Mounted'));

// Apply RBAC Middleware to ALL /admin routes
router.use(requireAdmin);

// Dashboard
router.get('/stats', getStats);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

// Products
router.get('/products', getProducts);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.patch('/products/:id/archive', archiveProduct);


// Customers
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.patch('/customers/:id/vip', toggleVIP);

// Inquiries
router.get('/inquiries', getInquiries);
router.get('/inquiries/:id', getInquiryById);
router.post('/inquiries/:id/reply', replyToInquiry);
router.patch('/inquiries/:id/status', updateInquiryStatus);

// Analytics
// Analytics
router.get('/analytics', getAnalytics);

// Health Leads
import { getHealthLeads, updateHealthLeadStatus } from '../controllers/healthLeadController.js';
router.get('/health-leads', getHealthLeads);
router.patch('/health-leads/:id/status', updateHealthLeadStatus);

// Life Leads
import { getLifeLeads, updateLifeLeadStatus } from '../controllers/lifeLeadController.js';
router.get('/life-leads', getLifeLeads);
router.patch('/life-leads/:id/status', updateLifeLeadStatus);

// Motor Leads
// Motor Leads
import { getMotorLeads, updateMotorLeadStatus } from '../controllers/motorLeadController.js';
router.get('/motor-leads', getMotorLeads);
router.patch('/motor-leads/:id/status', updateMotorLeadStatus);

// Mutual Fund Leads
import { getMutualFundLeads, updateMutualFundLeadStatus } from '../controllers/mutualFundLeadController.js';
router.get('/mutual-fund-leads', getMutualFundLeads);
router.patch('/mutual-fund-leads/:id/status', updateMutualFundLeadStatus);


// Export
import { exportLeads } from '../controllers/exportController.js';
router.get('/leads/export', exportLeads);

export default router;
