const Order = require('../models/Order');
const { createShipmentForOrder } = require('./shiprocketHelpers');

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;

const scheduleShiprocketShipment = (orderId, attempt = 1) => {
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId);
      if (!order || order.paymentStatus !== 'paid' || order.status === 'cancelled') {
        return;
      }

      if (order.shiprocket?.shipmentId) {
        return;
      }

      const result = await createShipmentForOrder(order);

      if (result.skipped) {
        return;
      }

      if (!result.success && attempt < MAX_ATTEMPTS) {
        console.warn(
          `[Shiprocket] Retry ${attempt + 1}/${MAX_ATTEMPTS} for order ${order.orderNumber}: ${result.error}`
        );
        scheduleShiprocketShipment(orderId, attempt + 1);
        return;
      }

      if (!result.success) {
        console.error(
          `[Shiprocket] Shipment failed for ${order.orderNumber} after ${attempt} attempt(s):`,
          result.error
        );
      }
    } catch (err) {
      console.error(`[Shiprocket] Shipment job error (attempt ${attempt}):`, err.message);
      if (attempt < MAX_ATTEMPTS) {
        scheduleShiprocketShipment(orderId, attempt + 1);
      }
    }
  }, attempt === 1 ? 1500 : RETRY_DELAY_MS);
};

module.exports = { scheduleShiprocketShipment };