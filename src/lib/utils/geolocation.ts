// Utility for calculating geographical distances and handling browser GPS location

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates distance in kilometers between two lat/lng coordinates using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats a distance in km into an Arabic string.
 * e.g., 0.8 km -> "800 متر", 2.4 km -> "2.4 كم"
 */
export function formatArabicDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} متر`;
  }
  return `${distanceKm} كم`;
}

/**
 * Requests the user's current GPS position via the Browser Geolocation API.
 */
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("متصفحك لا يدعم خاصية تحديد الموقع الجغرافي (Geolocation)."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        let msg = "تعذر الحصول على موقعك الجغرافي.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "تم رفض إذن تحديد الموقع. يرجى تفعيل إذن الوصول للموقع في إعدادات متصفحك للبحث عن أقرب عيادة.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "إشارة تحديد الموقع الجغرافي غير متوفرة حالياً.";
        } else if (err.code === err.TIMEOUT) {
          msg = "انتهت مهلة طلب تحديد الموقع الجغرافي.";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
