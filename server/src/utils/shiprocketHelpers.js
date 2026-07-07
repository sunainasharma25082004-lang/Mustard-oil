const ShiprocketSettings = require("../models/ShiprocketSettings");
const { encrypt, decrypt } = require("./encryption");

const SETTINGS_KEY = "shiprocket";
const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const SHIPROCKET_AUTH_URL = `${SHIPROCKET_BASE_URL}/auth/login`;

const SHIPROCKET_TO_ORDER_STATUS = {
  NEW: "confirmed",
  PROCESSING: "confirmed",
  "READY TO SHIP": "confirmed",
  "PICKUP SCHEDULED": "confirmed",
  "PICKUP QUEUED": "confirmed",
  "PICKUP RESCHEDULED": "confirmed",
  "PICKUP EXCEPTION": "confirmed",
  SHIPPED: "shipped",
  "IN TRANSIT": "shipped",
  "OUT FOR DELIVERY": "shipped",
  "OUT FOR PICKUP": "shipped",
  "REACHED AT DESTINATION HUB": "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  CANCELED: "cancelled",
  RTO: "cancelled",
  "RTO DELIVERED": "cancelled",
  "RTO IN TRANSIT": "cancelled",
  LOST: "cancelled",
  DAMAGED: "cancelled",
};

const getShiprocketSettings = async () => {
  let settings = await ShiprocketSettings.findOne({ key: SETTINGS_KEY });
  if (!settings) {
    settings = await ShiprocketSettings.create({ key: SETTINGS_KEY });
  }
  return settings;
};

const hasStoredCredentials = (settings) =>
  Boolean(settings?.email?.trim() && settings?.password);

const getDecryptedCredentials = (settings) => {
  const email = settings.email || "";
  if (!settings.password) {
    return { email, password: "" };
  }

  try {
    const password = decrypt(settings.password);
    if (!password) {
      throw new Error(
        "Saved password could not be decrypted — re-enter and save credentials",
      );
    }
    return { email, password };
  } catch (err) {
    throw new Error(
      err.message || "Re-enter Shiprocket password and save again in admin",
    );
  }
};

const authenticateShiprocket = async (email, password) => {
  if (!email?.trim() || !password) {
    throw new Error("Shiprocket email and password are required");
  }

  let response;
  try {
    response = await fetch(SHIPROCKET_AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
  } catch (err) {
    throw new Error(
      `Cannot reach Shiprocket API — check internet connection (${err.message})`,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.token) {
    const apiMessage = data.message || data.error || data.errors?.[0];
    const hint =
      response.status === 403 ||
      /invalid email and password/i.test(apiMessage || "")
        ? " Use API user credentials from Shiprocket → Settings → API (not your normal login password)."
        : "";
    const message =
      apiMessage ||
      (typeof data === "string" ? data : null) ||
      `Shiprocket authentication failed (HTTP ${response.status})`;
    throw new Error(`${message}.${hint}`.replace(/\.\./g, "."));
  }

  return data.token;
};

const testShiprocketConnection = async (email, password) => {
  const token = await authenticateShiprocket(email, password);
  return { success: true, token };
};

const mergeCredentials = (settings, { email, password }) => {
  const mergedEmail = email?.trim() || settings.email;
  const stored = getDecryptedCredentials(settings);
  let mergedPassword = stored.password;

  if (password && password !== "********") {
    mergedPassword = password;
  }

  return { email: mergedEmail, password: mergedPassword };
};

const saveShiprocketCredentials = async ({ email, password, enabled }) => {
  const settings = await getShiprocketSettings();
  const merged = mergeCredentials(settings, { email, password });

  if (!merged.email) {
    throw new Error("Shiprocket email is required");
  }

  if (!merged.password) {
    throw new Error("Shiprocket password is required");
  }

  settings.email = merged.email;
  settings.password = encrypt(merged.password);

  if (typeof enabled === "boolean") {
    settings.enabled = enabled;
  }

  await settings.save();
  return settings;
};

const saveShiprocketConfig = async (config = {}) => {
  const settings = await getShiprocketSettings();
  const fields = [
    "pickupLocation",
    "pickupPincode",
    "companyName",
    "companyPhone",
    "companyEmail",
    "companyAddress",
    "companyCity",
    "companyState",
    "companyPincode",
    "defaultWeight",
    "defaultLength",
    "defaultBreadth",
    "defaultHeight",
    "autoAssignAwb",
  ];

  for (const field of fields) {
    if (config[field] !== undefined) {
      settings[field] = config[field];
    }
  }

  await settings.save();
  return settings;
};

const storeConnectionResult = async (settings, token) => {
  settings.connectionStatus = "connected";
  settings.lastTestedAt = new Date();
  settings.token = encrypt(token);
  settings.tokenExpiresAt = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
  await settings.save();
  return settings;
};

const markConnectionFailed = async (settings) => {
  settings.connectionStatus = "failed";
  settings.lastTestedAt = new Date();
  await settings.save();
  return settings;
};

const {
  getShiprocketWebhookUrl,
  isLocalApiUrl,
  getPublicApiBaseUrl,
} = require("./publicUrl");

const getWebhookUrlForAdmin = () => getShiprocketWebhookUrl();

const formatSettingsForAdmin = (settings) => ({
  enabled: settings.enabled,
  email: settings.email,
  password: settings.password ? "********" : "",
  configured: hasStoredCredentials(settings),
  connectionStatus: settings.connectionStatus || "unknown",
  lastTestedAt: settings.lastTestedAt || null,
  updatedAt: settings.updatedAt,
  webhookUrl: getWebhookUrlForAdmin(),
  webhookUrlIsLocal: isLocalApiUrl(getPublicApiBaseUrl({ preferPublic: true })),
  webhookSecretConfigured: Boolean(
    process.env.SHIPROCKET_WEBHOOK_SECRET?.trim(),
  ),
  pickupLocation: settings.pickupLocation || "Primary",
  pickupPincode: settings.pickupPincode || "",
  companyName: settings.companyName || "",
  companyPhone: settings.companyPhone || "",
  companyEmail: settings.companyEmail || "",
  companyAddress: settings.companyAddress || "",
  companyCity: settings.companyCity || "",
  companyState: settings.companyState || "Delhi",
  companyPincode: settings.companyPincode || "",
  defaultWeight: settings.defaultWeight ?? 0.5,
  defaultLength: settings.defaultLength ?? 20,
  defaultBreadth: settings.defaultBreadth ?? 15,
  defaultHeight: settings.defaultHeight ?? 10,
  autoAssignAwb: settings.autoAssignAwb !== false,
});

const isShiprocketEnabled = async () => {
  const settings = await getShiprocketSettings();
  return Boolean(settings.enabled && hasStoredCredentials(settings));
};

const getShiprocketToken = async () => {
  const settings = await getShiprocketSettings();
  if (!settings.enabled) return null;

  if (
    settings.token &&
    settings.tokenExpiresAt &&
    settings.tokenExpiresAt > new Date()
  ) {
    try {
      return decrypt(settings.token);
    } catch {
      settings.token = "";
      settings.tokenExpiresAt = null;
      await settings.save();
    }
  }

  const { email, password } = getDecryptedCredentials(settings);
  if (!email || !password) return null;

  const token = await authenticateShiprocket(email, password);
  await storeConnectionResult(settings, token);
  return token;
};

const formatShiprocketError = (data, httpStatus) => {
  if (Array.isArray(data?.errors)) {
    return data.errors.join(", ");
  }
  if (data?.errors && typeof data.errors === "object") {
    return Object.entries(data.errors)
      .map(
        ([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`,
      )
      .join("; ");
  }
  return (
    data?.message ||
    data?.error ||
    data?.response?.data?.awb_assign_error ||
    `Shiprocket API error (HTTP ${httpStatus})`
  );
};

const shiprocketRequest = async (method, path, body) => {
  const token = await getShiprocketToken();
  if (!token) {
    throw new Error("Shiprocket is not configured or enabled");
  }

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${SHIPROCKET_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(formatShiprocketError(data, response.status));
  }

  if (
    data &&
    typeof data === "object" &&
    Object.prototype.hasOwnProperty.call(data, "status_code") &&
    Number(data.status_code) === 0
  ) {
    throw new Error(formatShiprocketError(data, response.status));
  }

  if (
    data &&
    typeof data === "object" &&
    Number(data.awb_assign_status) === 0
  ) {
    throw new Error(formatShiprocketError(data, response.status));
  }

  return data;
};

const normalizeChannelOrderId = (value) => String(value || "").trim();

const orderMatchesChannelId = (record, target) => {
  if (!record || !target) return false;
  const channel = normalizeChannelOrderId(record.channel_order_id);
  const orderId = normalizeChannelOrderId(record.order_id);
  return channel === target || orderId === target;
};

const extractFromOrderRecord = (record) => {
  if (!record || typeof record !== "object") {
    return { shipmentId: null, shiprocketOrderId: null, channelOrderId: null };
  }

  const shipmentId =
    record.shipment_id ??
    record.shipmentId ??
    (Array.isArray(record.shipments) ? record.shipments[0]?.id : null);

  const shiprocketOrderId =
    record.id ?? record.order_id ?? record.sr_order_id ?? null;
  const channelOrderId = record.channel_order_id ?? record.order_id ?? null;

  return {
    shipmentId: shipmentId ? Number(shipmentId) : null,
    shiprocketOrderId: shiprocketOrderId ? Number(shiprocketOrderId) : null,
    channelOrderId: channelOrderId
      ? normalizeChannelOrderId(channelOrderId)
      : null,
  };
};

const extractFromCreateResponse = (result) => {
  if (!result || typeof result !== "object") {
    return { shipmentId: null, shiprocketOrderId: null, channelOrderId: null };
  }

  const blocks = [
    result,
    result.payload,
    result.data,
    result.response?.data,
  ].filter((b) => b && typeof b === "object" && !Array.isArray(b));

  for (const block of blocks) {
    const shipmentId =
      block.shipment_id ?? block.shipmentId ?? block.sr_shipment_id ?? null;
    const shiprocketOrderId =
      block.order_id ?? block.orderId ?? block.sr_order_id ?? null;

    if (shipmentId || shiprocketOrderId) {
      return {
        shipmentId: shipmentId ? Number(shipmentId) : null,
        shiprocketOrderId: shiprocketOrderId ? Number(shiprocketOrderId) : null,
        channelOrderId: block.channel_order_id
          ? normalizeChannelOrderId(block.channel_order_id)
          : null,
      };
    }
  }

  return extractFromOrderRecord(result);
};

const extractShiprocketIds = (result) => extractFromCreateResponse(result);

const fetchShiprocketOrderDetails = async (shiprocketOrderId) => {
  const data = await shiprocketRequest(
    "GET",
    `/orders/show/${shiprocketOrderId}`,
  );
  const record = data?.data || data;
  return extractFromOrderRecord(record);
};

const getShiprocketLiveOrderInfo = async (channelOrderId) => {
  const remote = await getShiprocketOrderByChannelId(channelOrderId);
  if (!remote?.raw) return null;

  const r = remote.raw;
  return {
    found: true,
    channelOrderId: r.channel_order_id || channelOrderId,
    shiprocketOrderId: remote.shiprocketOrderId || r.id,
    shipmentId: remote.shipmentId,
    status: r.status || r.shipment_status || null,
    channelName: r.channel_name || r.channel || "CUSTOM",
    customerName: r.customer_name || r.billing_customer_name || null,
    createdAt: r.created_at || r.order_date || null,
    awb: r.awb || r.awb_code || r.shipments?.[0]?.awb || null,
    dashboardUrl: "https://app.shiprocket.in/seller/orders",
    searchHint:
      "Shiprocket panel → Orders → search box mein ORDER NUMBER daalo (KRY-...), Shipment ID nahi",
  };
};

const getShiprocketOrderByChannelId = async (channelOrderId) => {
  const target = normalizeChannelOrderId(channelOrderId);
  if (!target) return null;

  let orders = [];

  try {
    const filtered = await shiprocketRequest(
      "GET",
      `/orders?filter_by=channel_order_id&filter=${encodeURIComponent(target)}&per_page=10`,
    );
    orders = filtered?.data || [];
  } catch (err) {
    console.warn("[Shiprocket] channel_order_id filter failed:", err.message);
  }

  if (!orders.length) {
    const searched = await shiprocketRequest(
      "GET",
      `/orders?search=${encodeURIComponent(target)}&per_page=20`,
    );
    orders = (searched?.data || []).filter((o) =>
      orderMatchesChannelId(o, target),
    );
  }

  const match = orders.find((o) => orderMatchesChannelId(o, target));
  if (!match) return null;

  return { ...extractFromOrderRecord(match), raw: match };
};

const resolveShiprocketIdsForOrder = async (order, createResult) => {
  if (
    createResult?.shipmentId &&
    normalizeChannelOrderId(createResult.channelOrderId) === order.orderNumber
  ) {
    return {
      ...createResult,
      channelOrderId: order.orderNumber,
      verified: true,
    };
  }

  let ids = createResult?.raw
    ? extractFromOrderRecord(createResult.raw)
    : extractFromCreateResponse(createResult);

  if (!ids.shipmentId && ids.shiprocketOrderId) {
    const details = await fetchShiprocketOrderDetails(ids.shiprocketOrderId);
    ids = {
      ...ids,
      ...details,
      channelOrderId: ids.channelOrderId || details.channelOrderId,
    };
  }

  if (!ids.shipmentId || !ids.shiprocketOrderId) {
    const byChannel = await getShiprocketOrderByChannelId(order.orderNumber);
    if (byChannel) {
      ids = { ...ids, ...byChannel };
    }
  }

  if (
    ids.channelOrderId &&
    normalizeChannelOrderId(ids.channelOrderId) !== order.orderNumber
  ) {
    throw new Error(
      `Shiprocket order mismatch — expected ${order.orderNumber}, got ${ids.channelOrderId}`,
    );
  }

  if (!ids.shipmentId) {
    throw new Error(
      "Order not found on Shiprocket dashboard — check API user is same account you login with",
    );
  }

  ids.channelOrderId = order.orderNumber;
  ids.verified = true;
  return ids;
};

const getPickupLocations = async () => {
  const data = await shiprocketRequest("GET", "/settings/company/pickup");
  const locations =
    data?.data?.shipping_address ||
    data?.shipping_address ||
    data?.data ||
    data;
  return Array.isArray(locations) ? locations : [];
};

const resolvePickupLocation = async (settings) => {
  const configured = (settings.pickupLocation || "Primary").trim();
  try {
    const locations = await getPickupLocations();
    if (!locations.length) return configured;

    const match = locations.find((loc) => {
      const name = String(loc.pickup_location || loc.name || "").trim();
      return name.toLowerCase() === configured.toLowerCase();
    });

    if (match) {
      return match.pickup_location || match.name || configured;
    }

    const fallback = locations[0]?.pickup_location || locations[0]?.name;
    if (fallback) {
      console.warn(
        `[Shiprocket] Pickup location "${configured}" not found — using "${fallback}"`,
      );
      return fallback;
    }
  } catch (err) {
    console.warn("[Shiprocket] Pickup locations fetch failed:", err.message);
  }

  return configured;
};

const findShiprocketOrderByChannelId = getShiprocketOrderByChannelId;

const formatOrderDate = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const splitCustomerName = (fullName) => {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0)
    return { firstName: "Customer", lastName: "Customer" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

const sanitizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

const calculateOrderWeight = (order, settings) => {
  const totalWeight = (order.items || []).reduce((sum, item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const weightPerUnit =
      Number(item.shippingWeightKg) || Number(settings.defaultWeight) || 0.5;
    return sum + weightPerUnit * quantity;
  }, 0);

  return Math.max(0.1, Number(totalWeight.toFixed(2)));
};

const calculateOrderDimensions = (order, settings) => {
  const defaults = {
    length: Number(settings.defaultLength) || 20,
    breadth: Number(settings.defaultBreadth) || 15,
    height: Number(settings.defaultHeight) || 10,
  };

  return (order.items || []).reduce(
    (acc, item) => ({
      length: Math.max(
        acc.length,
        Number(item.shippingLengthCm) || defaults.length,
      ),
      breadth: Math.max(
        acc.breadth,
        Number(item.shippingBreadthCm) || defaults.breadth,
      ),
      height: Math.max(
        acc.height,
        Number(item.shippingHeightCm) || defaults.height,
      ),
    }),
    { ...defaults },
  );
};

const buildShiprocketOrderPayload = (order, settings, pickupLocation) => {
  const { firstName, lastName } = splitCustomerName(order.customer.fullName);
  const state = order.customer.state || settings.companyState || "Haryana";
  const phone = sanitizePhone(order.customer.phone);
  const lineSubtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (!phone || phone.length < 10) {
    throw new Error(
      "Valid 10-digit customer phone is required for Shiprocket shipment",
    );
  }

  const dimensions = calculateOrderDimensions(order, settings);
  const weight = calculateOrderWeight(order, settings);

  const payload = {
    order_id: order.orderNumber,
    order_date: formatOrderDate(order.createdAt || new Date()),
    pickup_location: pickupLocation || settings.pickupLocation || "Primary",
    comment: `Karyor order ${order.orderNumber}`,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: order.customer.address,
    billing_address_2: order.customer.city,
    billing_city: order.customer.city,
    billing_pincode: String(order.customer.pincode).trim(),
    billing_state: state,
    billing_country: "India",
    billing_email:
      order.customer.email || settings.companyEmail || "karyorfarms@gmail.com",
    billing_phone: phone,
    shipping_is_billing: true,
    order_items: order.items.map((item, idx) => ({
      name: item.productName,
      sku: `KRY-${String(idx + 1).padStart(3, "0")}`,
      units: item.quantity,
      selling_price: Number(item.price),
      discount: 0,
      tax: 0,
    })),
    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: lineSubtotal,
    length: dimensions.length,
    breadth: dimensions.breadth,
    height: dimensions.height,
    weight,
  };

  return payload;
};

const checkServiceability = async ({
  pickupPincode,
  deliveryPincode,
  weight,
  cod = false,
}) => {
  const settings = await getShiprocketSettings();
  const pickup = String(
    pickupPincode || settings.pickupPincode || settings.companyPincode,
  ).trim();
  const delivery = String(deliveryPincode).trim();

  if (!pickup || !delivery) {
    throw new Error(
      "Pickup and delivery pincodes are required for serviceability check",
    );
  }

  const params = new URLSearchParams({
    pickup_postcode: pickup,
    delivery_postcode: delivery,
    weight: String(weight || settings.defaultWeight || 0.5),
    cod: cod ? "1" : "0",
  });

  const data = await shiprocketRequest(
    "GET",
    `/courier/serviceability/?${params.toString()}`,
  );

  const couriers = data?.data?.available_courier_companies || [];
  const serviceable = data?.data?.status === 1 || couriers.length > 0;

  const cheapest = couriers.reduce((best, courier) => {
    const rate = Number(courier.rate);
    if (!best || rate < best.rate) return { ...courier, rate };
    return best;
  }, null);

  return {
    serviceable,
    pickupPincode: pickup,
    deliveryPincode: delivery,
    couriers,
    recommendedCourier: cheapest,
    estimatedDeliveryDays: cheapest?.estimated_delivery_days || null,
    freightCharge: cheapest ? Number(cheapest.rate) : null,
  };
};

const createShiprocketOrder = async (order) => {
  const settings = await getShiprocketSettings();
  const pickupLocation = await resolvePickupLocation(settings);
  const payload = buildShiprocketOrderPayload(order, settings, pickupLocation);
  console.log(
    "[Shiprocket] Creating order:",
    order.orderNumber,
    "pickup:",
    pickupLocation,
  );
  const result = await shiprocketRequest(
    "POST",
    "/orders/create/adhoc",
    payload,
  );
  console.log(
    "[Shiprocket] Create response:",
    order.orderNumber,
    JSON.stringify(result).slice(0, 500),
  );
  return result;
};

const assignAwbToShipment = async (shipmentId, courierId) =>
  shiprocketRequest("POST", "/courier/assign/awb", {
    shipment_id: Number(shipmentId),
    courier_id: Number(courierId),
  });

const generatePickup = async (shipmentId) =>
  shiprocketRequest("POST", "/courier/generate/pickup", {
    shipment_id: [Number(shipmentId)],
  });

const trackByAwb = async (awb) =>
  shiprocketRequest("GET", `/courier/track/awb/${awb}`);

const cancelShiprocketOrder = async (orderIds) =>
  shiprocketRequest("POST", "/orders/cancel", {
    ids: Array.isArray(orderIds) ? orderIds : [orderIds],
  });

const mapShiprocketStatusToOrder = (statusLabel) => {
  if (!statusLabel) return null;
  const key = String(statusLabel).toUpperCase().trim();
  return SHIPROCKET_TO_ORDER_STATUS[key] || null;
};

const applyShipmentResultToOrder = (order, result, { error } = {}) => {
  if (!order.shiprocket) order.shiprocket = {};

  if (error) {
    order.shiprocket.error = error;
    order.shiprocket.lastSyncedAt = new Date();
    return order;
  }

  const ids = result?.verified
    ? result
    : result?.shipmentId || result?.shiprocketOrderId
      ? result
      : extractFromCreateResponse(result);

  if (ids.shipmentId) order.shiprocket.shipmentId = ids.shipmentId;
  if (ids.shiprocketOrderId)
    order.shiprocket.shiprocketOrderId = ids.shiprocketOrderId;
  if (ids.channelOrderId) order.shiprocket.channelOrderId = ids.channelOrderId;
  if (ids.verified) order.shiprocket.verified = true;

  const awbBlocks = [
    result,
    result?.response?.data,
    result?.payload,
    result?.data,
  ].filter(Boolean);
  let awb = null;
  let courierName = null;

  for (const block of awbBlocks) {
    awb = awb || block.awb_code || block.awb;
    courierName = courierName || block.courier_name;
  }

  if (awb) {
    order.shiprocket.awb = String(awb);
    order.shiprocket.trackingUrl = `https://shiprocket.co/tracking/${awb}`;
  }
  if (courierName) order.shiprocket.courierName = courierName;

  if (ids.shipmentId || ids.shiprocketOrderId) {
    order.shiprocket.status = "created";
    order.shiprocket.statusLabel = order.shiprocket.verified
      ? "Verified on Shiprocket"
      : "Order created in Shiprocket";
    order.shiprocket.error = "";
    order.shiprocket.createdAt = order.shiprocket.createdAt || new Date();
  }

  order.shiprocket.lastSyncedAt = new Date();
  return order;
};

const createShipmentForOrder = async (order) => {
  const enabled = await isShiprocketEnabled();
  if (!enabled) {
    return { skipped: true, reason: "Shiprocket disabled" };
  }

  if (order.shiprocket?.shipmentId && order.shiprocket?.verified) {
    return { skipped: true, reason: "Shipment already exists", order };
  }

  if (order.shiprocket?.shipmentId && !order.shiprocket?.verified) {
    order.shiprocket.shipmentId = undefined;
    order.shiprocket.shiprocketOrderId = undefined;
    order.shiprocket.verified = false;
  }

  const settings = await getShiprocketSettings();

  try {
    let createResult;
    try {
      createResult = await createShiprocketOrder(order);
    } catch (createError) {
      const isDuplicate = /already exists|duplicate/i.test(
        createError.message || "",
      );
      if (!isDuplicate) {
        throw createError;
      }
      createResult = await getShiprocketOrderByChannelId(order.orderNumber);
      if (!createResult?.shipmentId) {
        throw createError;
      }
    }

    const verifiedIds = await resolveShiprocketIdsForOrder(order, createResult);
    applyShipmentResultToOrder(order, verifiedIds);

    const shipmentId = order.shiprocket.shipmentId;
    if (!shipmentId) {
      throw new Error(
        "Shiprocket order could not be verified — open Shiprocket → Orders → search by order number: " +
          order.orderNumber,
      );
    }

    if (settings.autoAssignAwb) {
      try {
        const weight = calculateOrderWeight(order, settings);
        const serviceability = await checkServiceability({
          pickupPincode: settings.pickupPincode || settings.companyPincode,
          deliveryPincode: order.customer.pincode,
          weight,
          cod: order.paymentMethod === "cod",
        });

        const courierId = serviceability.recommendedCourier?.courier_company_id;
        if (courierId) {
          const awbResult = await assignAwbToShipment(shipmentId, courierId);
          applyShipmentResultToOrder(order, awbResult);

          if (order.shiprocket.awb) {
            order.status = "shipped";
            order.shiprocket.status = "awb_assigned";
            order.shiprocket.statusLabel = "AWB assigned";
          }
        }
      } catch (awbError) {
        order.shiprocket.error = `AWB assignment pending: ${awbError.message}`;
        console.warn(
          `[Shiprocket] AWB assignment failed for ${order.orderNumber}:`,
          awbError.message,
        );
      }
    }

    await order.save();
    return { success: true, order };
  } catch (error) {
    applyShipmentResultToOrder(order, null, { error: error.message });
    await order.save();
    console.error(
      `[Shiprocket] Shipment creation failed for ${order.orderNumber}:`,
      error.message,
    );
    return { success: false, error: error.message, order };
  }
};

const syncOrderFromWebhook = async (payload) => {
  const awb = payload?.awb || payload?.awb_code;
  const orderNumber = payload?.order_id || payload?.channel_order_id;
  const shipmentId = payload?.shipment_id;
  const statusLabel =
    payload?.current_status || payload?.shipment_status || payload?.status;

  const Order = require("../models/Order");
  let order = null;

  if (orderNumber) {
    order = await Order.findOne({ orderNumber: String(orderNumber) });
  }
  if (!order && shipmentId) {
    order = await Order.findOne({
      "shiprocket.shipmentId": Number(shipmentId),
    });
  }
  if (!order && awb) {
    order = await Order.findOne({ "shiprocket.awb": String(awb) });
  }

  if (!order) {
    return { found: false, orderNumber, shipmentId, awb };
  }

  if (!order.shiprocket) order.shiprocket = {};

  if (awb) {
    order.shiprocket.awb = String(awb);
    order.shiprocket.trackingUrl = `https://shiprocket.co/tracking/${awb}`;
  }
  if (payload?.courier_name)
    order.shiprocket.courierName = payload.courier_name;
  if (statusLabel) {
    order.shiprocket.statusLabel = String(statusLabel);
    const mapped = mapShiprocketStatusToOrder(statusLabel);
    if (mapped) order.status = mapped;
  }

  order.shiprocket.lastSyncedAt = new Date();
  await order.save();

  return { found: true, order };
};

const getPublicShippingConfig = async () => {
  const settings = await getShiprocketSettings();
  return {
    shiprocketEnabled: Boolean(
      settings.enabled && hasStoredCredentials(settings),
    ),
    pickupPincode: settings.pickupPincode || settings.companyPincode || "",
    defaultWeight: settings.defaultWeight ?? 0.5,
  };
};

module.exports = {
  SETTINGS_KEY,
  SHIPROCKET_TO_ORDER_STATUS,
  getShiprocketSettings,
  hasStoredCredentials,
  getDecryptedCredentials,
  mergeCredentials,
  authenticateShiprocket,
  testShiprocketConnection,
  saveShiprocketCredentials,
  saveShiprocketConfig,
  storeConnectionResult,
  markConnectionFailed,
  formatSettingsForAdmin,
  isShiprocketEnabled,
  getShiprocketToken,
  shiprocketRequest,
  checkServiceability,
  createShiprocketOrder,
  assignAwbToShipment,
  generatePickup,
  trackByAwb,
  cancelShiprocketOrder,
  mapShiprocketStatusToOrder,
  createShipmentForOrder,
  syncOrderFromWebhook,
  getPublicShippingConfig,
  calculateOrderWeight,
  buildShiprocketOrderPayload,
  extractShiprocketIds,
  extractFromCreateResponse,
  extractFromOrderRecord,
  getPickupLocations,
  resolvePickupLocation,
  findShiprocketOrderByChannelId,
  getShiprocketOrderByChannelId,
  fetchShiprocketOrderDetails,
  resolveShiprocketIdsForOrder,
  getShiprocketLiveOrderInfo,
};
