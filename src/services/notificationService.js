import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notification Service
 * Handles local notifications (works in Expo Go)
 * 
 * NOTE: Remote push notifications require a development build in SDK 53+
 * Local notifications (scheduleNotification, showNotification) work fine in Expo Go!
 * 
 * For testing in Expo Go:
 * - Local notifications: ✅ Fully supported
 * - Permission requests: ✅ Fully supported
 * - Push tokens: ❌ Requires development build
 * 
 * All notification features in this app use LOCAL notifications,
 * so they work perfectly in Expo Go!
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 * @returns {Promise<boolean>} - True if permission granted
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // Get push token for production use
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2E7D32',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get push notification token
 * NOTE: This is disabled in Expo Go for SDK 53+
 * For remote push notifications, use a development build
 * @returns {Promise<string|null>} - Push token or null
 */
export const getPushToken = async () => {
  try {
    // Skip in Expo Go as it's not supported in SDK 53+
    if (__DEV__ && !Platform.isTV) {
      console.log('Push token retrieval skipped in Expo Go. Use development build for remote notifications.');
      return null;
    }
    
    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Push Token:', token.data);
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Schedule a local notification
 * @param {Object} notification - Notification details
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {Object} notification.data - Additional data
 * @param {number} notification.seconds - Delay in seconds (default: 1)
 * @returns {Promise<string>} - Notification ID
 */
export const scheduleNotification = async ({ title, body, data = {}, seconds = 1 }) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: {
        seconds,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

/**
 * Show immediate notification
 * @param {Object} notification - Notification details
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {Object} notification.data - Additional data
 * @returns {Promise<string>} - Notification ID
 */
export const showNotification = async ({ title, body, data = {} }) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });

    return notificationId;
  } catch (error) {
    console.error('Error showing notification:', error);
    throw error;
  }
};

/**
 * Cancel a scheduled notification
 * @param {string} notificationId - Notification ID to cancel
 */
export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
    throw error;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
    throw error;
  }
};

/**
 * Add notification received listener
 * @param {Function} callback - Callback function
 * @returns {Object} - Subscription object
 */
export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Add notification response listener (when user taps notification)
 * @param {Function} callback - Callback function
 * @returns {Object} - Subscription object
 */
export const addNotificationResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Request-specific notification helpers
 */

// Notification for successful request creation
export const notifyRequestCreated = async (requestData) => {
  const wasteTypeEmojis = {
    household: '🏠',
    recyclable: '♻️',
    organic: '🌱',
    electronic: '📱',
    hazardous: '⚠️',
  };

  const emoji = wasteTypeEmojis[requestData.wasteType] || '📋';

  return await showNotification({
    title: '✅ Request Created Successfully!',
    body: `${emoji} Your ${requestData.wasteType} waste collection request has been submitted. We'll notify you when it's scheduled.`,
    data: {
      type: 'request_created',
      requestId: requestData._id || requestData.id,
      wasteType: requestData.wasteType,
    },
  });
};

// Notification for request status update
export const notifyRequestStatusUpdate = async (requestId, status) => {
  const statusMessages = {
    pending: '⏳ Your request is pending review',
    approved: '✅ Your request has been approved!',
    scheduled: '📅 Your collection has been scheduled!',
    in_progress: '🚛 Collection is in progress',
    completed: '✔️ Collection completed successfully!',
    cancelled: '❌ Your request has been cancelled',
  };

  const message = statusMessages[status] || `Your request status: ${status}`;

  return await showNotification({
    title: 'Request Status Update',
    body: message,
    data: {
      type: 'request_status_update',
      requestId,
      status,
    },
  });
};

// Notification reminder for upcoming collection
export const notifyUpcomingCollection = async (requestData, hoursBeforeCollection) => {
  const wasteTypeEmojis = {
    household: '🏠',
    recyclable: '♻️',
    organic: '🌱',
    electronic: '📱',
    hazardous: '⚠️',
  };

  const emoji = wasteTypeEmojis[requestData.wasteType] || '📋';

  return await showNotification({
    title: '🔔 Collection Reminder',
    body: `${emoji} Your ${requestData.wasteType} waste collection is scheduled in ${hoursBeforeCollection} hours. Please have your waste ready!`,
    data: {
      type: 'collection_reminder',
      requestId: requestData._id || requestData.id,
      wasteType: requestData.wasteType,
    },
  });
};

export default {
  requestNotificationPermissions,
  getPushToken,
  scheduleNotification,
  showNotification,
  cancelNotification,
  cancelAllNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  notifyRequestCreated,
  notifyRequestStatusUpdate,
  notifyUpcomingCollection,
};

