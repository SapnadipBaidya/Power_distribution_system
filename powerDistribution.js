// Constants
const MAX_CAPACITY = 100; // Total system capacity
const SAFE_CAPACITY = 92; // Usable capacity
const DEVICE_MAX = 40; // Maximum power a single device can consume

// Global Variables
let currentConsumption = 0; // Total power currently being consumed
let activeDevices = []; // Array to track active devices

/**
 * Add a new device
 * @param {string} deviceId - Unique identifier for the device
 * @param {number} timestamp - Connection timestamp
 */
function addDevice(deviceId, timestamp) {
  const remainingCapacity = SAFE_CAPACITY - currentConsumption;
  const allocatedPower = Math.min(remainingCapacity, DEVICE_MAX);
  currentConsumption += allocatedPower;

  activeDevices.push({
    deviceId,
    timestamp,
    currentUsage: allocatedPower,
    maxAllowed: allocatedPower,
  });

  redistributePower();
}

/**
 * Remove a device
 * @param {string} deviceId - Unique identifier for the device
 */
function removeDevice(deviceId) {
  const deviceIndex = activeDevices.findIndex(device => device.deviceId === deviceId);

  if (deviceIndex !== -1) {
    currentConsumption -= activeDevices[deviceIndex].currentUsage;
    activeDevices.splice(deviceIndex, 1); // Remove device from active list
    redistributePower();
  }
}

/**
 * Update a device's consumption
 * @param {string} deviceId - Unique identifier for the device
 * @param {number} newConsumption - New power consumption requested by the device
 */
function updateDevice(deviceId, newConsumption) {
  const device = activeDevices.find(device => device.deviceId === deviceId);

  if (device) {
    const adjustment = newConsumption - device.currentUsage;
    if (currentConsumption + adjustment <= SAFE_CAPACITY) {
      currentConsumption += adjustment;
      device.currentUsage = newConsumption;
    } else {
      // Maintain the max allowed if there's insufficient capacity
      device.currentUsage = device.maxAllowed;
    }
    redistributePower();
  }
}

/**
 * Redistribute power among devices (FIFO)
 */
function redistributePower() {
  let remainingCapacity = SAFE_CAPACITY - currentConsumption;

  activeDevices
    .sort((a, b) => a.timestamp - b.timestamp) // Sort devices by connection time
    .forEach(device => {
      if (device.currentUsage < DEVICE_MAX && remainingCapacity > 0) {
        const additionalPower = Math.min(DEVICE_MAX - device.currentUsage, remainingCapacity);
        device.currentUsage += additionalPower;
        currentConsumption += additionalPower;
        remainingCapacity -= additionalPower;
      }
    });
}

// Example Usage
addDevice('A', 0); // Device A gets 40 units
addDevice('B', 1); // Device B gets 40 units
addDevice('C', 2); // Device C gets 12 units
updateDevice('A', 20); // Device A reduces to 20 units, C gets the freed 20 units
removeDevice('B'); // Device B disconnects, C gets additional power

// Print active devices
console.log('Active Devices:', activeDevices);
