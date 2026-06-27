const listeners = new Set();

export const subscriptionEvents = {
  on(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  emit(payload) {
    listeners.forEach((cb) => cb(payload));
  },
};