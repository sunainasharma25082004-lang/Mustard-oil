const { BetaAnalyticsDataClient } = require('@google-analytics/data');

let client = null;
let property = null;

function parseServiceAccountCredentials() {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    console.warn('[GA4] GA4_SERVICE_ACCOUNT_JSON is not valid JSON');
    return null;
  }
}

function getGa4Client() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const credentials = parseServiceAccountCredentials();

  if (!propertyId || !credentials) {
    return null;
  }

  if (!client) {
    client = new BetaAnalyticsDataClient({ credentials });
    property = `properties/${propertyId}`;
  }

  return { client, property };
}

function isGa4Configured() {
  return Boolean(getGa4Client());
}

function readMetric(row, index = 0) {
  return Number(row?.metricValues?.[index]?.value || 0);
}

function readDimension(row, index = 0) {
  return row?.dimensionValues?.[index]?.value || '';
}

module.exports = {
  getGa4Client,
  isGa4Configured,
  readMetric,
  readDimension,
};