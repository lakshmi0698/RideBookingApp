/**
 * Drivers Module
 * Handles all driver-related functionality
 */

import { storage } from './storage.js';
import { ui } from './ui.js';

export const drivers = {
    /**
     * Initialize drivers functionality
     */
    init() {
        this.setupAddDriverButton();
        this.setupAddDriverForm();
        this.renderDrivers();
    },

    /**
     * Setup add driver button
     */
    setupAddDriverButton() {
        const addBtn = document.getElementById('add-driver-btn');
        
        addBtn.addEventListener('click', () => {
            document.getElementById('add-driver-form').reset();
            ui.showModal('add-driver-modal');
        });
    },

    /**
     * Setup add driver form
     */
    setupAddDriverForm() {
        const form = document.getElementById('add-driver-form');
        const cancelBtn = document.getElementById('cancel-driver-btn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddDriver(form);
        });

        cancelBtn.addEventListener('click', () => {
            ui.hideModal('add-driver-modal');
        });
    },

    /**
     * Handle add driver submission
     */
    handleAddDriver(form) {
        const driverData = {
            name: document.getElementById('driver-name').value,
            phone: document.getElementById('driver-phone').value,
            vehicle: document.getElementById('driver-vehicle').value,
            plate: document.getElementById('driver-plate').value,
            rating: parseFloat(document.getElementById('driver-rating').value),
            status: document.getElementById('driver-status').value
        };

        // Validate
        if (!driverData.name || !driverData.phone || !driverData.vehicle || !driverData.plate) {
            ui.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Validate rating
        if (driverData.rating < 1 || driverData.rating > 5) {
            ui.showToast('Rating must be between 1 and 5', 'error');
            return;
        }

        // Save driver
        const newDriver = storage.addDriver(driverData);
        
        if (newDriver) {
            ui.showToast('Driver added successfully!', 'success');
            ui.hideModal('add-driver-modal');
            form.reset();
            this.renderDrivers();
        } else {
            ui.showToast('Failed to add driver', 'error');
        }
    },

    /**
     * Render drivers grid
     */
    renderDrivers() {
        const driversList = document.getElementById('drivers-list');
        const drivers = storage.getDrivers();

        if (drivers.length === 0) {
            driversList.innerHTML = this.getEmptyState();
            return;
        }

        // Sort by rating (highest first)
        drivers.sort((a, b) => b.rating - a.rating);

        driversList.innerHTML = drivers.map(driver => this.createDriverCard(driver)).join('');

        // Attach event listeners
        this.attachDriverEventListeners();
    },

    /**
     * Create driver card HTML
     */
    createDriverCard(driver) {
        const statusClass = `status-${driver.status}`;
        const stars = '⭐'.repeat(Math.floor(driver.rating));
        const initials = this.getInitials(driver.name);
        
        return `
            <div class="driver-card" data-driver-id="${driver.id}">
                <div class="driver-avatar">${initials}</div>
                <div class="driver-name">${driver.name}</div>
                <div class="driver-rating">${stars} ${driver.rating.toFixed(1)}</div>
                
                <div class="driver-info">
                    <div class="driver-info-item">
                        <span>Phone:</span>
                        <strong>${driver.phone}</strong>
                    </div>
                    <div class="driver-info-item">
                        <span>Vehicle:</span>
                        <strong>${driver.vehicle}</strong>
                    </div>
                    <div class="driver-info-item">
                        <span>Plate:</span>
                        <strong>${driver.plate}</strong>
                    </div>
                </div>

                <span class="driver-status ${statusClass}">${ui.capitalize(driver.status)}</span>

                <div class="driver-actions">
                    <button class="btn btn-danger" data-driver-id="${driver.id}">Remove</button>
                </div>
            </div>
        `;
    },

    /**
     * Get initials from name
     */
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    },

    /**
     * Get empty state HTML
     */
    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <h3>No drivers registered</h3>
                <p>Add your first driver to get started!</p>
            </div>
        `;
    },

    /**
     * Attach event listeners to driver cards
     */
    attachDriverEventListeners() {
        // Remove buttons
        document.querySelectorAll('.driver-card .btn-danger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const driverId = e.target.dataset.driverId;
                this.deleteDriver(driverId);
            });
        });
    },

    /**
     * Delete driver
     */
    deleteDriver(driverId) {
        if (ui.confirm('Are you sure you want to remove this driver?')) {
            const deleted = storage.deleteDriver(driverId);
            
            if (deleted) {
                ui.showToast('Driver removed successfully', 'success');
                this.renderDrivers();
            } else {
                ui.showToast('Failed to remove driver', 'error');
            }
        }
    }
};
