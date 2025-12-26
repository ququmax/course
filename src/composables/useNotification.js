import { ref } from 'vue'

// Simple toast notification system
const notifications = ref([])
let notificationId = 0

export function useNotification() {
  function show(message, type = 'info', duration = 3000) {
    const id = ++notificationId
    const notification = {
      id,
      message,
      type, // 'info', 'success', 'warning', 'error'
      duration
    }

    notifications.value.push(notification)

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  function remove(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function success(message, duration = 3000) {
    return show(message, 'success', duration)
  }

  function error(message, duration = 4000) {
    return show(message, 'error', duration)
  }

  function warning(message, duration = 3500) {
    return show(message, 'warning', duration)
  }

  function info(message, duration = 3000) {
    return show(message, 'info', duration)
  }

  return {
    notifications,
    show,
    remove,
    success,
    error,
    warning,
    info
  }
}

export default useNotification
