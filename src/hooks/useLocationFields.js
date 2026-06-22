import { useCallback, useRef, useState } from 'react';
import { locationApi } from '../utils/api';
import { sanitizePincodeInput } from '../utils/formValidation';
import { getBrowserPosition } from '../utils/geolocation';

export function useLocationFields({ formData, setFormData, fieldKeys = {} }) {
  const addressKey = fieldKeys.address || 'address';
  const cityKey = fieldKeys.city || 'city';
  const stateKey = fieldKeys.state || 'state';
  const pincodeKey = fieldKeys.pincode || 'pincode';

  const [pincodeOptions, setPincodeOptions] = useState([]);
  const [locationHint, setLocationHint] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [locating, setLocating] = useState(false);
  const skipCityLookup = useRef(false);

  const applyPatch = useCallback(
    (patch) => {
      setFormData((prev) => ({ ...prev, ...patch }));
    },
    [setFormData]
  );

  const lookupByPincode = useCallback(
    async (pincode) => {
      if (!/^\d{6}$/.test(pincode)) return;
      setLookingUp(true);
      setLocationHint('');
      try {
        const res = await locationApi.byPincode(pincode);
        skipCityLookup.current = true;
        applyPatch({
          [cityKey]: res.data.city || formData[cityKey],
          [stateKey]: res.data.state || formData[stateKey],
          [pincodeKey]: res.data.pincode || pincode,
        });
        setPincodeOptions([]);
        setLocationHint(`Location: ${res.data.city}, ${res.data.state}`);
        setTimeout(() => {
          skipCityLookup.current = false;
        }, 300);
      } catch {
        setLocationHint('Pincode not found. Please check and try again.');
      } finally {
        setLookingUp(false);
      }
    },
    [applyPatch, cityKey, stateKey, pincodeKey, formData]
  );

  const lookupByCity = useCallback(
    async (city) => {
      const query = String(city || '').trim();
      if (query.length < 3 || skipCityLookup.current) return;

      setLookingUp(true);
      setLocationHint('');
      try {
        const res = await locationApi.byCity(query);
        const { options = [], city: resolvedCity, state, pincode } = res.data;

        if (options.length === 1) {
          skipCityLookup.current = true;
          applyPatch({
            [cityKey]: resolvedCity || query,
            [stateKey]: state || formData[stateKey],
            [pincodeKey]: pincode || formData[pincodeKey],
          });
          setPincodeOptions([]);
          setLocationHint(`Auto-filled: ${resolvedCity}, ${state}`);
          setTimeout(() => {
            skipCityLookup.current = false;
          }, 300);
        } else if (options.length > 1) {
          setPincodeOptions(options);
          if (state) {
            applyPatch({ [stateKey]: state });
          }
          setLocationHint('Select your pincode from the list below');
        }
      } catch {
        setPincodeOptions([]);
        setLocationHint('');
      } finally {
        setLookingUp(false);
      }
    },
    [applyPatch, cityKey, stateKey, pincodeKey, formData]
  );

  const handlePincodeChange = useCallback(
    (value) => {
      const pincode = sanitizePincodeInput(value);
      applyPatch({ [pincodeKey]: pincode });
      setPincodeOptions([]);
      setLocationHint('');
      if (pincode.length === 6) {
        lookupByPincode(pincode);
      }
    },
    [applyPatch, pincodeKey, lookupByPincode]
  );

  const handleCityChange = useCallback(
    (value) => {
      applyPatch({ [cityKey]: value });
      setPincodeOptions([]);
      if (!skipCityLookup.current) {
        setLocationHint('');
      }
    },
    [applyPatch, cityKey]
  );

  const handleCityBlur = useCallback(() => {
    lookupByCity(formData[cityKey]);
  }, [lookupByCity, formData, cityKey]);

  const selectPincodeOption = useCallback(
    (option) => {
      skipCityLookup.current = true;
      applyPatch({
        [pincodeKey]: option.pincode,
        [cityKey]: option.city,
        [stateKey]: option.state,
      });
      setPincodeOptions([]);
      setLocationHint(`Selected: ${option.city} (${option.pincode})`);
      setTimeout(() => {
        skipCityLookup.current = false;
      }, 300);
    },
    [applyPatch, pincodeKey, cityKey, stateKey]
  );

  const useCurrentLocation = useCallback(async () => {
    setLocating(true);
    setLocationHint('');
    setPincodeOptions([]);

    try {
      const position = await getBrowserPosition();
      const { latitude, longitude } = position.coords;
      const res = await locationApi.reverseGeocode(latitude, longitude);
      const { address, city, state, pincode } = res.data;

      skipCityLookup.current = true;
      const patch = {};
      if (address) patch[addressKey] = address;
      if (city) patch[cityKey] = city;
      if (state) patch[stateKey] = state;
      if (pincode) patch[pincodeKey] = pincode;
      applyPatch(patch);

      if (pincode && /^\d{6}$/.test(pincode)) {
        setLocationHint(
          `Current location: ${city || 'your area'}${state ? `, ${state}` : ''}`
        );
        await lookupByPincode(pincode);
      } else if (city) {
        setLocationHint(`Address filled for ${city}. Pincode verify kar lena.`);
      } else {
        setLocationHint('Address filled. Please verify all fields.');
      }
    } finally {
      setLocating(false);
      setTimeout(() => {
        skipCityLookup.current = false;
      }, 300);
    }
  }, [addressKey, cityKey, stateKey, pincodeKey, applyPatch, lookupByPincode]);

  return {
    pincodeOptions,
    locationHint,
    lookingUp,
    locating,
    handlePincodeChange,
    handleCityChange,
    handleCityBlur,
    selectPincodeOption,
    lookupByPincode,
    useCurrentLocation,
  };
}