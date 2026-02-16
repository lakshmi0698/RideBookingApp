/**
 * Main Application Entry Point
 * Orchestrates all modules and initializes the application
 */

import { ui } from './ui.js';
import { rides } from './rides.js';
import { drivers } from './drivers.js';

class RideBookingApp {
    constructor() {
        this.currentTab = 'booking';
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup all functionality
     */
    setup() {
        console.log('🚗 RideFlow App Initializing...');

        // Initialize UI handlers
        ui.initModalHandlers();

        // Initialize tab navigation
        this.setupTabNavigation();

        // Initialize modules
        rides.init();
        drivers.init();

        // Add smooth scroll behavior
        this.setupSmoothScroll();

        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();

        console.log('✅ RideFlow App Ready!');
    }

    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName, navButtons, tabContents);
            });
        });
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName, navButtons, tabContents) {
        // Update current tab
        this.currentTab = tabName;

        // Update nav buttons
        navButtons.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update tab content
        tabContents.forEach(content => {
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Refresh data when switching to tabs
        if (tabName === 'rides') {
            rides.renderRides();
        } else if (tabName === 'drivers') {
            drivers.renderDrivers();
        }

        // Smooth scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Setup smooth scroll for anchor links
     */
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + 1, 2, 3 to switch tabs
            if (e.altKey) {
                const tabMap = {
                    '1': 'booking',
                    '2': 'rides',
                    '3': 'drivers'
                };

                const tab = tabMap[e.key];
                if (tab) {
                    e.preventDefault();
                    const navBtn = document.querySelector(`[data-tab="${tab}"]`);
                    if (navBtn) navBtn.click();
                }
            }

            // Ctrl/Cmd + K for quick booking (focus on pickup)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const bookingTab = document.querySelector('[data-tab="booking"]');
                if (bookingTab) bookingTab.click();
                setTimeout(() => {
                    const pickupInput = document.getElementById('pickup');
                    if (pickupInput) pickupInput.focus();
                }, 100);
            }
        });
    }
}

// Initialize the application
const app = new RideBookingApp();

// Export for debugging in console
window.RideFlowApp = app;
