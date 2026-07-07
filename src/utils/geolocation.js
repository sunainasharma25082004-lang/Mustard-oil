export function isGeolocationSupported() {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

async function getGeoPermissionState() {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return null;
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return null;
  }
}

export async function getBrowserPosition(options = {}) {
  if (!isGeolocationSupported()) {
    throw new Error('Your browser does not support location access.');
  }

  if (typeof window !== 'undefined' && !window.isSecureContext) {
    throw new Error(
      'Location access works only on a secure connection. Please use https or localhost and allow location.'
    );
  }

  const permissionState = await getGeoPermissionState();
  if (permissionState === 'denied') {
    throw new Error(
      'Location access is blocked in browser settings. Please enable location for this site and try again.'
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              'Location permission denied. Please allow location access for this site and try again.'
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