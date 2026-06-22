export function isGeolocationSupported() {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

export function getBrowserPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Your browser does not support location access.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              'Location permission denied. Browser settings se location allow karo, phir dubara try karo.'
            )
          );
          return;
        }
        if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error('Location unavailable. GPS on karo ya thodi der baad try karo.'));
          return;
        }
        if (error.code === error.TIMEOUT) {
          reject(new Error('Location request timed out. Please try again.'));
          return;
        }
        reject(new Error('Could not get your current location.'));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
        ...options,
      }
    );
  });
}