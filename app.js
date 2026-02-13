// ============================================================================
// DATA MODELS & STATE MANAGEMENT
// ============================================================================

class RideBookingApp {
    constructor() {
        this.rides = this.loadFromStorage('rides') || [];
        this.drivers = this.loadFromStorage('drivers') || this.getDefaultDrivers();
        this.currentView = 'book';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderRides();
        this.renderDrivers();
        this.updateStats();
    }

    // Default drivers for demo purposes
    getDefaultDrivers() {
        return [
            {
                id: this.generateId(),
                name: 'Alex Rivera',
                phone: '+1 (555) 123-4567',
                vehicle: 'Tesla Model 3',
                plate: 'NRD-2024',
                rating: 4.9,
                status: 'available'
            },
            {
                id: this.generateId(),
                name: 'Jordan Chen',
                phone: '+1 (555) 234-5678',
                vehicle: 'BMW X5',
                plate: 'LUX-8901',
                rating: 4.8,
                status: 'busy'
            },
            {
                id: this.generateId(),
                name: 'Sam Rodriguez',
                phone: '+1 (555) 345-6789',
                vehicle: 'Mercedes S-Class',
                plate: 'PRE-5432',
                rating: 5.0,
                status: 'available'
            }
        ];
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            this.showToast('error', 'Failed to save data');
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    }

    // ============================================================================
    // EVENT LISTENERS SETUP
    // ============================================================================

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Book Ride Form
        document.getElementById('booking-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createRide();
        });

        // Edit Ride Form
        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateRide();
        });

        // Driver Form
        document.getElementById('driver-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDriver();
        });

        // Add Driver Buttons
        document.getElementById('add-driver-btn').addEventListener('click', () => this.openDriverModal());
        document.getElementById('add-first-driver').addEventListener('click', () => this.openDriverModal());

        // Modal Close Buttons
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModals();
            });
        });

        // Switch to book view from empty state
        document.querySelectorAll('[data-view]').forEach(btn => {
            if (!btn.classList.contains('nav-btn')) {
                btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
            }
        });
    }

    // ============================================================================
    // VIEW MANAGEMENT
    // ============================================================================

    switchView(viewName) {
        this.currentView = viewName;
        
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');

        // Refresh data if needed
        if (viewName === 'rides') {
            this.renderRides();
            this.updateStats();
        } else if (viewName === 'drivers') {
            this.renderDrivers();
        }
    }

    // ============================================================================
    // RIDE CRUD OPERATIONS
    // ============================================================================

    createRide() {
        const formData = {
            id: this.generateId(),
            pickup: document.getElementById('pickup').value.trim(),
            dropoff: document.getElementById('dropoff').value.trim(),
            rideType: document.getElementById('ride-type').value,
            passengers: parseInt(document.getElementById('passengers').value),
            notes: document.getElementById('notes').value.trim(),
            status: 'pending',
            bookedAt: new Date().toISOString()
        };

        // Validation
        if (!formData.pickup || !formData.dropoff || !formData.rideType) {
            this.showToast('error', 'Please fill in all required fields');
            return;
        }

        this.rides.unshift(formData);
        this.saveToStorage('rides', this.rides);
        
        // Reset form
        document.getElementById('booking-form').reset();
        
        this.showToast('success', 'Ride booked successfully!');
        this.switchView('rides');
        this.renderRides();
        this.updateStats();
    }

    readRide(id) {
        return this.rides.find(ride => ride.id === id);
    }

    updateRide() {
        const id = document.getElementById('edit-ride-id').value;
        const ride = this.readRide(id);
        
        if (!ride) {
            this.showToast('error', 'Ride not found');
            return;
        }

        ride.pickup = document.getElementById('edit-pickup').value.trim();
        ride.dropoff = document.getElementById('edit-dropoff').value.trim();
        ride.rideType = document.getElementById('edit-ride-type').value;
        ride.passengers = parseInt(document.getElementById('edit-passengers').value);
        ride.notes = document.getElementById('edit-notes').value.trim();
        ride.status = document.getElementById('edit-status').value;

        this.saveToStorage('rides', this.rides);
        this.closeModals();
        this.renderRides();
        this.updateStats();
        this.showToast('success', 'Ride updated successfully!');
    }

    deleteRide(id) {
        if (!confirm('Are you sure you want to delete this ride?')) return;

        this.rides = this.rides.filter(ride => ride.id !== id);
        this.saveToStorage('rides', this.rides);
        this.renderRides();
        this.updateStats();
        this.showToast('success', 'Ride deleted successfully!');
    }

    openEditModal(id) {
        const ride = this.readRide(id);
        if (!ride) return;

        document.getElementById('edit-ride-id').value = ride.id;
        document.getElementById('edit-pickup').value = ride.pickup;
        document.getElementById('edit-dropoff').value = ride.dropoff;
        document.getElementById('edit-ride-type').value = ride.rideType;
        document.getElementById('edit-passengers').value = ride.passengers;
        document.getElementById('edit-notes').value = ride.notes || '';
        document.getElementById('edit-status').value = ride.status;

        document.getElementById('edit-modal').classList.add('active');
    }

    // ============================================================================
    // DRIVER CRUD OPERATIONS
    // ============================================================================

    saveDriver() {
        const id = document.getElementById('driver-id').value;
        const formData = {
            name: document.getElementById('driver-name').value.trim(),
            phone: document.getElementById('driver-phone').value.trim(),
            vehicle: document.getElementById('driver-vehicle').value.trim(),
            plate: document.getElementById('driver-plate').value.trim(),
            rating: parseFloat(document.getElementById('driver-rating').value),
            status: document.getElementById('driver-status').value
        };

        // Validation
        if (!formData.name || !formData.phone || !formData.vehicle || !formData.plate) {
            this.showToast('error', 'Please fill in all required fields');
            return;
        }

        if (id) {
            // Update existing driver
            const driver = this.drivers.find(d => d.id === id);
            if (driver) {
                Object.assign(driver, formData);
                this.showToast('success', 'Driver updated successfully!');
            }
        } else {
            // Create new driver
            formData.id = this.generateId();
            this.drivers.push(formData);
            this.showToast('success', 'Driver added successfully!');
        }

        this.saveToStorage('drivers', this.drivers);
        this.closeModals();
        this.renderDrivers();
    }

    openDriverModal(id = null) {
        const modal = document.getElementById('driver-modal');
        const title = document.getElementById('driver-modal-title');
        const submitBtn = document.getElementById('driver-submit-btn');

        if (id) {
            const driver = this.drivers.find(d => d.id === id);
            if (!driver) return;

            title.textContent = 'Edit Driver';
            submitBtn.textContent = 'Update Driver';
            
            document.getElementById('driver-id').value = driver.id;
            document.getElementById('driver-name').value = driver.name;
            document.getElementById('driver-phone').value = driver.phone;
            document.getElementById('driver-vehicle').value = driver.vehicle;
            document.getElementById('driver-plate').value = driver.plate;
            document.getElementById('driver-rating').value = driver.rating;
            document.getElementById('driver-status').value = driver.status;
        } else {
            title.textContent = 'Add Driver';
            submitBtn.textContent = 'Add Driver';
            document.getElementById('driver-form').reset();
            document.getElementById('driver-id').value = '';
        }

        modal.classList.add('active');
    }

    deleteDriver(id) {
        if (!confirm('Are you sure you want to delete this driver?')) return;

        this.drivers = this.drivers.filter(driver => driver.id !== id);
        this.saveToStorage('drivers', this.drivers);
        this.renderDrivers();
        this.showToast('success', 'Driver deleted successfully!');
    }

    // ============================================================================
    // RENDERING METHODS
    // ============================================================================

    renderRides() {
        const container = document.getElementById('rides-list');
        const emptyState = document.getElementById('empty-state');

        if (this.rides.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        container.innerHTML = this.rides.map((ride, index) => `
            <div class="ride-card" style="animation-delay: ${index * 0.1}s">
                <div class="ride-icon">${this.getRideIcon(ride.rideType)}</div>
                <div class="ride-info">
                    <div class="ride-route">
                        <span class="ride-route-from">${ride.pickup}</span>
                        <span> → </span>
                        <span class="ride-route-to">${ride.dropoff}</span>
                    </div>
                    <div class="ride-details">
                        <div class="ride-detail">
                            <span>🚗</span>
                            <span>${this.formatRideType(ride.rideType)}</span>
                        </div>
                        <div class="ride-detail">
                            <span>👥</span>
                            <span>${ride.passengers} passenger${ride.passengers > 1 ? 's' : ''}</span>
                        </div>
                        <div class="ride-detail">
                            <span>📅</span>
                            <span>${this.formatDate(ride.bookedAt)}</span>
                        </div>
                    </div>
                    ${ride.notes ? `<div class="ride-detail"><span>📝</span><span>${ride.notes}</span></div>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="ride-status ${ride.status}">${ride.status.replace('-', ' ')}</span>
                    <div class="ride-actions">
                        <button class="icon-btn" onclick="app.openEditModal('${ride.id}')" title="Edit">
                            ✏️
                        </button>
                        <button class="icon-btn delete" onclick="app.deleteRide('${ride.id}')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderDrivers() {
        const container = document.getElementById('drivers-list');
        const emptyState = document.getElementById('drivers-empty');

        if (this.drivers.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        container.innerHTML = this.drivers.map((driver, index) => `
            <div class="driver-card" style="animation-delay: ${index * 0.1}s">
                <div class="driver-avatar">👤</div>
                <div class="driver-name">${driver.name}</div>
                <div class="driver-vehicle">${driver.vehicle} • ${driver.plate}</div>
                <span class="driver-status-badge ${driver.status}">${driver.status}</span>
                <div class="driver-meta">
                    <div class="driver-meta-item">
                        <span class="driver-meta-label">Rating</span>
                        <span class="driver-meta-value">⭐ ${driver.rating.toFixed(1)}</span>
                    </div>
                    <div class="driver-meta-item">
                        <span class="driver-meta-label">Phone</span>
                        <span class="driver-meta-value">${this.formatPhone(driver.phone)}</span>
                    </div>
                </div>
                <div class="driver-actions">
                    <button class="icon-btn" onclick="app.openDriverModal('${driver.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="icon-btn delete" onclick="app.deleteDriver('${driver.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const totalRides = this.rides.length;
        const activeRides = this.rides.filter(r => 
            r.status === 'pending' || r.status === 'confirmed' || r.status === 'in-progress'
        ).length;

        document.getElementById('total-rides').textContent = totalRides;
        document.getElementById('active-rides').textContent = activeRides;
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    getRideIcon(rideType) {
        const icons = {
            economy: '🚗',
            comfort: '🚙',
            premium: '🚘',
            xl: '🚐'
        };
        return icons[rideType] || '🚗';
    }

    formatRideType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    formatPhone(phone) {
        // Simple phone formatting
        return phone.replace(/(\d{1,3})(\d{3})(\d{3})(\d{4})/, '($2) $3-$4');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showToast(type, message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// ============================================================================
// INITIALIZE APP
// ============================================================================

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new RideBookingApp();
});
