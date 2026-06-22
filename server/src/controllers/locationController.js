const { isValidPincode } = require('../utils/formValidation');

const parsePostalBlock = (data) => (Array.isArray(data) ? data[0] : data);

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

module.exports = { getByPincode, getByCity };