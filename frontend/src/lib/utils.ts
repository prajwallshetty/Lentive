export function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  
  if (d < 0.1) {
    return 'Less than 100m away';
  }
  if (d < 1) {
    return `${Math.round(d * 1000)}m away`;
  }
  return `${d.toFixed(1)} km away`;
}

export interface TravelPredictions {
  distance: string;
  driveMins: number;
  bikeMins: number;
  walkMins: number;
  rawKm: number;
}

export function predictTravelTimes(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): TravelPredictions {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km

  const walkMins = Math.round(d * 12); // ~5 km/h (12 mins/km)
  const bikeMins = Math.round(d * 4);  // ~15 km/h (4 mins/km)
  const driveMins = Math.round(d * 2) + 3; // ~30 km/h (2 mins/km + 3 mins traffic buffer)

  let distanceStr = '';
  if (d < 0.1) {
    distanceStr = 'Less than 100m';
  } else if (d < 1) {
    distanceStr = `${Math.round(d * 1000)}m`;
  } else {
    distanceStr = `${d.toFixed(1)} km`;
  }

  return {
    distance: distanceStr,
    driveMins: Math.max(1, driveMins),
    bikeMins: Math.max(1, bikeMins),
    walkMins: Math.max(1, walkMins),
    rawKm: d
  };
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
