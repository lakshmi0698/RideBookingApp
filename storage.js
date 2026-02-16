/**
 * Storage Module
 * Handles all localStorage operations for rides and drivers
 */

const STORAGE_KEYS = {
    RIDES: 'rideflow_rides',
    DRIVERS: 'rideflow_drivers',
    RIDE_COUNTER: 'rideflow_ride_counter'
};

export const storage = {
    /**
     * Get all rides from localStorage
     */
    getRides() {
        try {
            const rides = localStorage.getItem(STORAGE_KEYS.RIDES);
            return rides ? JSON.parse(rides) : [];
        } catch (error) {
            console.error('Error getting rides:', error);
            return [];
        }
    },

    /**
     * Save rides to localStorage
     */
    saveRides(rides) {
        try {
            localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
            return true;
        } catch (error) {
            console.error('Error saving rides:', error);
            return false;
        }
    },

    /**
     * Add a new ride
     */
    addRide(ride) {
        const rides = this.getRides();
        const counter = this.getRideCounter();
        
        const newRide = {
            id: `RIDE-${counter}`,
            ...ride,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        
        rides.push(newRide);
        this.saveRides(rides);
        this.incrementRideCounter();
        
        return newRide;
    },

    /**
     * Update an existing ride
     */
    updateRide(id, updatedData) {
        const rides = this.getRides();
        const index = rides.findIndex(ride => ride.id === id);
        
        if (index !== -1) {
            rides[index] = {
                ...rides[index],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            this.saveRides(rides);
            return rides[index];
        }
        
        return null;
    },

    /**
     * Delete a ride
     */
    deleteRide(id) {
        const rides = this.getRides();
        const filteredRides = rides.filter(ride => ride.id !== id);
        this.saveRides(filteredRides);
        return true;
    },

    /**
     * Get ride by ID
     */
    getRideById(id) {
        const rides = this.getRides();
        return rides.find(ride => ride.id === id) || null;
    },

    /**
     * Get rides by status
     */
    getRidesByStatus(status) {
        const rides = this.getRides();
        if (status === 'all') return rides;
        return rides.filter(ride => ride.status === status);
    },

    /**
     * Get all drivers from localStorage
     */
    getDrivers() {
        try {
            const drivers = localStorage.getItem(STORAGE_KEYS.DRIVERS);
            return drivers ? JSON.parse(drivers) : [];
        } catch (error) {
            console.error('Error getting drivers:', error);
            return [];
        }
    },

    /**
     * Save drivers to localStorage
     */
    saveDrivers(drivers) {
        try {
            localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
            return true;
        } catch (error) {
            console.error('Error saving drivers:', error);
            return false;
        }
    },

    /**
     * Add a new driver
     */
    addDriver(driver) {
        const drivers = this.getDrivers();
        
        const newDriver = {
            id: `DRV-${Date.now()}`,
            ...driver,
            createdAt: new Date().toISOString()
        };
        
        drivers.push(newDriver);
        this.saveDrivers(drivers);
        
        return newDriver;
    },

    /**
     * Delete a driver
     */
    deleteDriver(id) {
        const drivers = this.getDrivers();
        const filteredDrivers = drivers.filter(driver => driver.id !== id);
        this.saveDrivers(filteredDrivers);
        return true;
    },

    /**
     * Get ride counter
     */
    getRideCounter() {
        try {
            const counter = localStorage.getItem(STORAGE_KEYS.RIDE_COUNTER);
            return counter ? parseInt(counter, 10) : 1001;
        } catch (error) {
            return 1001;
        }
    },

    /**
     * Increment ride counter
     */
    incrementRideCounter() {
        const counter = this.getRideCounter();
        localStorage.setItem(STORAGE_KEYS.RIDE_COUNTER, (counter + 1).toString());
    },

    /**
     * Clear all data (for testing)
     */
    clearAll() {
        localStorage.removeItem(STORAGE_KEYS.RIDES);
        localStorage.removeItem(STORAGE_KEYS.DRIVERS);
        localStorage.removeItem(STORAGE_KEYS.RIDE_COUNTER);
    }
};
