const { isValidPincode } = require('../utils/formValidation');

const parsePostalBlock = (data) => (Array.isArray(data) ? data[0] : data);

const NOMINATIM_USER_AGENT = 'KaryorMustardOil/1.0 (checkout address lookup)';

const pickCity = (addr = {}) =>
  addr.city ||
  addr.town ||
  addr.village ||
  addr.municipality ||
  addr.county ||
  addr.state_district ||
  addr.district ||
  '';

const buildStreetAddress = (addr = {}) => {
  const lineParts = [
    addr.house_number,
    addr.house_name,
    addr.building,
    addr.road || addr.street || addr.pedestrian,
    addr.suburb || addr.neighbourhood || addr.residential || addr.quarter,
    addr.locality,
  ].filter(Boolean);

  const line = lineParts.join(', ').trim();
  if (line.length >= 10) return line;

  const area = pickCity(addr);
  if (area && line) return `${line}, ${area}`;
  return line || area;
};

const normalizeIndianPincode = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 6 ? digits : '';
};

const reverseGeocode = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lon ?? req.query.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude are required',
      });
    }

    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'json');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', 'en');

    const response = await fetch(url, {
      headers: { 'User-Agent': NOMINATIM_USER_AGENT },
    });

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: 'Could not resolve your location. Please enter address manually.',
      });
    }

    const data = await response.json();
    const addr = data?.address || {};
    const city = pickCity(addr);
    const state = addr.state || '';
    let pincode = normalizeIndianPincode(addr.postcode);

    if (!pincode && city) {
      try {
        const postalRes = await fetch(
          `https://api.postalpincode.in/postoffice/${encodeURIComponent(city)}`
        );
        const postalData = await postalRes.json();
        const block = parsePostalBlock(postalData);
        if (block?.Status === 'Success' && block?.PostOffice?.length) {
          pincode = normalizeIndianPincode(block.PostOffice[0].Pincode);
        }
      } catch {
        // Pincode fallback is best-effort
      }
    }

    const address = buildStreetAddress(addr);

    if (!address && !city && !pincode) {
      return res.status(404).json({
        success: false,
        message: 'No address found for this location. Please enter manually.',
      });
    }

    res.json({
      success: true,
      data: {
        address,
        city,
        state,
        pincode,
        latitude: lat,
        longitude: lng,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getByPincode = async (req, res, next) => {
  try {
    const pincode = String(req.params.pincode || '').trim();
    if (!isValidPincode(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 6-digit pincode is required',
      });
    }

    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    const block = parsePostalBlock(data);

    if (block?.Status !== 'Success' || !block?.PostOffice?.length) {
      return res.status(404).json({
        success: false,
        message: 'Pincode not found',
      });
    }

    const first = block.PostOffice[0];
    res.json({
      success: true,
      data: {
        city: first.District || first.Name,
        state: first.State,
        pincode: first.Pincode,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getByCity = async (req, res, next) => {
  try {
    const city = String(req.params.city || '').trim();
    if (city.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Enter at least 3 characters for city lookup',
      });
    }

    const response = await fetch(
      `https://api.postalpincode.in/postoffice/${encodeURIComponent(city)}`
    );
    const data = await response.json();
    const block = parsePostalBlock(data);

    if (block?.Status !== 'Success' || !block?.PostOffice?.length) {
      return res.status(404).json({
        success: false,
        message: 'No locations found for this city',
      });
    }

    const seen = new Set();
    const options = [];

    for (const office of block.PostOffice) {
      if (!office?.Pincode || seen.has(office.Pincode)) continue;
      seen.add(office.Pincode);
      options.push({
        pincode: office.Pincode,
        city: office.District || office.Name,
        state: office.State,
        area: office.Name,
      });
      if (options.length >= 25) break;
    }

    res.json({
      success: true,
      data: {
        options,
        city: options[0]?.city || city,
        state: options[0]?.state || '',
        pincode: options[0]?.pincode || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getByPincode, getByCity, reverseGeocode };