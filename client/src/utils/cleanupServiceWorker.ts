const SW_RELOAD_GUARD_KEY = 'sw-cleanup-reloaded';

const unregisterAllServiceWorkers = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length === 0) {
      return false;
    }

    await Promise.all(registrations.map((registration) => registration.unregister()));
    return true;
  } catch (error) {
    console.error('Не удалось отключить service worker:', error);
    return false;
  }
};

const clearAllCaches = async (): Promise<void> => {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  } catch (error) {
    console.error('Не удалось очистить кэш браузера:', error);
  }
};

export const cleanupStaleServiceWorkers = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }

  const hadActiveController = Boolean(navigator.serviceWorker?.controller);
  const hasUnregisteredWorkers = await unregisterAllServiceWorkers();

  if (!hasUnregisteredWorkers) {
    return false;
  }

  await clearAllCaches();

  const alreadyReloaded = sessionStorage.getItem(SW_RELOAD_GUARD_KEY) === 'true';

  if (hadActiveController && !alreadyReloaded) {
    sessionStorage.setItem(SW_RELOAD_GUARD_KEY, 'true');
    window.location.reload();
    return true;
  }

  sessionStorage.removeItem(SW_RELOAD_GUARD_KEY);
  return false;
};
