const {
  getGa4Client,
  isGa4Configured,
  readMetric,
  readDimension,
} = require('../utils/ga4Client');

const EMPTY_VISITOR_STATS = {
  configured: false,
  source: 'google_analytics',
  activeNow: 0,
  uniqueVisitorsToday: 0,
  pageViewsToday: 0,
  uniqueVisitorsThisWeek: 0,
  pageViewsThisWeek: 0,
  totalPageViews: 0,
  topPages: [],
  setupHint: 'Set GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_JSON on the API server, then add the service account email as Viewer in Google Analytics.',
};

const getVisitorStats = async () => {
  const ga4 = getGa4Client();
  if (!ga4) {
    return { ...EMPTY_VISITOR_STATS };
  }

  const { client, property } = ga4;

  try {
    const [
      [todayReport],
      [weekReport],
      [allTimeReport],
      [realtimeReport],
      [topPagesReport],
    ] = await Promise.all([
      client.runReport({
        property,
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: '2020-01-01', endDate: 'today' }],
        metrics: [{ name: 'screenPageViews' }],
      }),
      client.runRealtimeReport({
        property,
        metrics: [{ name: 'activeUsers' }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 8,
      }),
    ]);

    const todayRow = todayReport.rows?.[0];
    const weekRow = weekReport.rows?.[0];
    const allTimeRow = allTimeReport.rows?.[0];
    const realtimeRow = realtimeReport.rows?.[0];

    const topPages = (topPagesReport.rows || []).map((row) => ({
      path: readDimension(row, 0) || '/',
      views: readMetric(row, 0),
    }));

    return {
      configured: true,
      source: 'google_analytics',
      activeNow: readMetric(realtimeRow, 0),
      uniqueVisitorsToday: readMetric(todayRow, 0),
      pageViewsToday: readMetric(todayRow, 1),
      uniqueVisitorsThisWeek: readMetric(weekRow, 0),
      pageViewsThisWeek: readMetric(weekRow, 1),
      totalPageViews: readMetric(allTimeRow, 0),
      topPages,
    };
  } catch (error) {
    console.warn('[GA4] Failed to fetch visitor stats:', error.message);
    return {
      ...EMPTY_VISITOR_STATS,
      configured: isGa4Configured(),
      error: 'Could not load Google Analytics data. Check GA4_PROPERTY_ID, service account access, and Analytics Data API.',
    };
  }
};

module.exports = { getVisitorStats };