import geoip from "geoip-lite";

export const getGeoLocation = (ip: string): string => {
  const geo = geoip.lookup(ip);
  return geo ? `${geo.city}, ${geo.country}` : "unknown";
};
