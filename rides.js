/**
 * Rides Module
 * Handles all ride-related functionality
 */

import { storage } from './storage.js';
import { ui } from './ui.js';

export const rides = {
    currentFilter: 'all',

    /**
     * Initialize rides functionality
     */
    init() {
        this.setupBookingForm();
        this.setupEditForm();
        this.setupFilterButtons();
        this.updateStats();
        this.renderRides();
    },

    /**
     * Setup booking form
     */
    setupBookingForm() {
        const form = document.getElementById('booking-form');
        const rideTypeSelect = document.getElementById('ride-type');
        const priceDisplay = document.getElementById('price-amount');

        // Update price when ride type changes
        rideTypeSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const price = selectedOption.dataset.price || 0;
            priceDisplay.textContent = ui.formatCurrency(price);
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBooking(form);
        });
    },

    /**
     * Handle booking submission
     */
    handleBooking(form) {
        const formData = new FormData(form);
        const rideTypeSelect = document.getElementById('ride-type');
        const selectedOption = rideTypeSelect.options[rideTypeSelect.selectedIndex];
        
        const rideData = {
            pickup: document.getElementById('pickup').value,
            dropoff: document.getElementById('dropoff').value,
            rideType: document.getElementById('ride-type').value,
            price: parseFloat(selectedOption.dataset.price),
            passengers: parseInt(document.getElementById('passengers').value),
            specialRequests: document.getElementById('special-requests').value
        };

        // Validate
        if (!rideData.pickup || !rideData.dropoff || !rideData.rideType) {
            ui.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Save ride
        const newRide = storage.addRide(rideData);
        
        if (newRide) {
            ui.showToast('Ride booked successfully!', 'success');
            form.reset();
            document.getElementById('price-amount').textContent = '$0';
            
            // Update UI
            this.updateStats();
            
            // Switch to rides tab
            setTimeout(() => {
                this.switchToRidesTab();
            }, 1000);
        } else {
            ui.showToast('Failed to book ride', 'error');
        }
    },

    /**
     * Switch to rides tab
     */
    switchToRidesTab() {
        const ridesTab = document.querySelector('[data-tab="rides"]');
        if (ridesTab) {
            ridesTab.click();
        }
    },

    /**
     * Setup edit form
     */
    setupEditForm() {
        const form = document.getElementById('edit-ride-form');
        const cancelBtn = document.getElementById('cancel-edit-btn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditSubmit();
        });

        cancelBtn.addEventListener('click', () => {
            ui.hideModal('edit-ride-modal');
        });
    },

    /**
     * Handle edit submission
     */
    handleEditSubmit() {
        const rideId = document.getElementById('edit-ride-id').value;
        const rideTypeSelect = document.getElementById('edit-ride-type');
        const selectedOption = rideTypeSelect.options[rideTypeSelect.selectedIndex];
        
        const updatedData = {
            pickup: document.getElementById('edit-pickup').value,
            dropoff: document.getElementById('edit-dropoff').value,
            rideType: document.getElementById('edit-ride-type').value,
            price: parseFloat(selectedOption.dataset.price),
            passengers: parseInt(document.getElementById('edit-passengers').value),
            status: document.getElementById('edit-status').value,
            specialRequests: document.getElementById('edit-special-requests').value
        };

        const updated = storage.updateRide(rideId, updatedData);
        
        if (updated) {
            ui.showToast('Ride updated successfully!', 'success');
            ui.hideModal('edit-ride-modal');
            this.renderRides();
            this.updateStats();
        } else {
            ui.showToast('Failed to update ride', 'error');
        }
    },

    /**
     * Setup filter buttons
     */
    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Apply filter
                const filter = btn.dataset.filter;
                this.currentFilter = filter;
                this.renderRides();
            });
        });
    },

    /**
     * Render rides list
     */
    renderRides() {
        const ridesList = document.getElementById('rides-list');
        const rides = storage.getRidesByStatus(this.currentFilter);

        if (rides.length === 0) {
            ridesList.innerHTML = this.getEmptyState();
            return;
        }

        // Sort by date (newest first)
        rides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        ridesList.innerHTML = rides.map(ride => this.createRideCard(ride)).join('');

        // Attach event listeners
        this.attachRideEventListeners();
    },

    /**
     * Create ride card HTML
     */
    createRideCard(ride) {
        const statusClass = ui.getStatusClass(ride.status);
        const icon = ui.getRideTypeIcon(ride.rideType);
        
        return `
            <div class="ride-card" data-ride-id="${ride.id}">
                <div class="ride-header">
                    <div class="ride-route">
                        <div class="ride-location">
                            <span class="location-icon">📍</span>
                            <span class="location-text">${ride.pickup}</span>
                        </div>
                        <div class="ride-location">
                            <span class="location-icon">🎯</span>
                            <span class="location-text">${ride.dropoff}</span>
                        </div>
                    </div>
                    <span class="ride-status ${statusClass}">${ui.capitalize(ride.status)}</span>
                </div>

                <div class="ride-details">
                    <div class="ride-detail-item">
                        <span class="detail-label">Ride ID</span>
                        <span class="detail-value">${ride.id}</span>
                    </div>
                    <div class="ride-detail-item">
                        <span class="detail-label">Type</span>
                        <span class="detail-value">${icon} ${ui.capitalize(ride.rideType)}</span>
                    </div>
                    <div class="ride-detail-item">
                        <span class="detail-label">Fare</span>
                        <span class="detail-value">${ui.formatCurrency(ride.price)}</span>
                    </div>
                </div>

                ${ride.specialRequests ? `
                    <div class="ride-special-requests">
                        <strong>Special Requests:</strong>
                        <p>${ride.specialRequests}</p>
                    </div>
                ` : ''}

                <div class="ride-actions">
                    <button class="btn-edit" data-ride-id="${ride.id}">Edit</button>
                    <button class="btn-delete" data-ride-id="${ride.id}">Delete</button>
                </div>
            </div>
        `;
    },

    /**
     * Get empty state HTML
     */
    getEmptyState() {
        const messages = {
            all: { icon: '🚗', title: 'No rides booked yet', text: 'Book your first ride to get started!' },
            pending: { icon: '⏳', title: 'No pending rides', text: 'All rides have been confirmed or completed.' },
            confirmed: { icon: '✅', title: 'No confirmed rides', text: 'No rides are currently confirmed.' },
            'in-progress': { icon: '🚕', title: 'No rides in progress', text: 'No active rides at the moment.' },
            completed: { icon: '✓', title: 'No completed rides', text: 'Complete your first ride!' }
        };

        const msg = messages[this.currentFilter] || messages.all;

        return `
            <div class="empty-state">
                <div class="empty-icon">${msg.icon}</div>
                <h3>${msg.title}</h3>
                <p>${msg.text}</p>
            </div>
        `;
    },

    /**
     * Attach event listeners to ride cards
     */
    attachRideEventListeners() {
        // Edit buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rideId = e.target.dataset.rideId;
                this.editRide(rideId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rideId = e.target.dataset.rideId;
                this.deleteRide(rideId);
            });
        });
    },

    /**
     * Edit ride
     */
    editRide(rideId) {
        const ride = storage.getRideById(rideId);
        
        if (!ride) {
            ui.showToast('Ride not found', 'error');
            return;
        }

        // Populate form
        document.getElementById('edit-ride-id').value = ride.id;
        document.getElementById('edit-pickup').value = ride.pickup;
        document.getElementById('edit-dropoff').value = ride.dropoff;
        document.getElementById('edit-ride-type').value = ride.rideType;
        document.getElementById('edit-passengers').value = ride.passengers;
        document.getElementById('edit-status').value = ride.status;
        document.getElementById('edit-special-requests').value = ride.specialRequests || '';

        ui.showModal('edit-ride-modal');
    },

    /**
     * Delete ride
     */
    deleteRide(rideId) {
        if (ui.confirm('Are you sure you want to delete this ride?')) {
            const deleted = storage.deleteRide(rideId);
            
            if (deleted) {
                ui.showToast('Ride deleted successfully', 'success');
                this.renderRides();
                this.updateStats();
            } else {
                ui.showToast('Failed to delete ride', 'error');
            }
        }
    },

    /**
     * Update statistics
     */
    updateStats() {
        const rides = storage.getRides();
        
        const total = rides.length;
        const active = rides.filter(r => 
            r.status === 'pending' || 
            r.status === 'confirmed' || 
            r.status === 'in-progress'
        ).length;
        const completed = rides.filter(r => r.status === 'completed').length;

        document.getElementById('total-rides').textContent = total;
        document.getElementById('active-rides').textContent = active;
        document.getElementById('completed-rides').textContent = completed;
    }
};
