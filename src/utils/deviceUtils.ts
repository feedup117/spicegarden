export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('restaurant-device-id');
  
  if (!deviceId) {
    deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('restaurant-device-id', deviceId);
  }
  
  return deviceId;
};

export const clearDeviceSession = (): void => {
  localStorage.removeItem('restaurant-device-id');
  localStorage.removeItem('restaurant-store');
};