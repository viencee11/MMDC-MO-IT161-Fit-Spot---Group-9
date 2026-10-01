/* FitSpot shared helpers and browser-only data service.
   Loaded (with defer) after toast.js and before script.js / admin.js / user.js. */
(function () {
    'use strict';

    const STORAGE_KEY = 'fitspot-browser-data-v1';
    const SESSION_KEY = 'fitspot-browser-session-v1';
    window.SERVER_HINT = '';

    function dateOffset(days) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + days);
        return date.toISOString().slice(0, 10);
    }

    function seedState() {
        return {
            next: { user: 5, plan: 3, fitnessClass: 6, schedule: 6, booking: 4, membership: 3 },
            users: [
                { id: 1, full_name: 'FitSpot Admin', email: 'admin@fitspot.com', password: 'admin123', role: 'admin', phone: '', address: '', created_at: dateOffset(-180) },
                { id: 2, full_name: 'Viena Grace Echavez', email: 'member@fitspot.com', password: 'member123', role: 'member', phone: '09171234567', address: 'Manila', created_at: dateOffset(-120) },
                { id: 3, full_name: 'Maria Chesam Leonor', email: 'maria@email.com', password: 'maria123', role: 'member', phone: '', address: '', created_at: dateOffset(-90) },
                { id: 4, full_name: 'Pedro Pareja', email: 'pedro@email.com', password: 'pedro123', role: 'member', phone: '', address: '', created_at: dateOffset(-60) }
            ],
            plans: [
                { id: 1, name: 'Basic Plan', price: 999, inclusions: 'Gym access; Locker access', is_active: 1 },
                { id: 2, name: 'Premium Plan', price: 1499, inclusions: 'Gym access; All group classes; Locker access', is_active: 1 }
            ],
            classes: [
                { id: 1, name: 'Zumba', description: 'High-energy dance workout for all levels.', capacity: 20, is_active: 1 },
                { id: 2, name: 'Yoga', description: 'Mindful movement, balance, and flexibility.', capacity: 15, is_active: 1 },
                { id: 3, name: 'Pilates', description: 'Core-focused low impact workout.', capacity: 12, is_active: 1 },
                { id: 4, name: 'Boxing', description: 'Build strength and confidence with guided drills.', capacity: 10, is_active: 1 },
                { id: 5, name: 'Strength Training', description: 'Progressive training for full-body strength.', capacity: 12, is_active: 1 }
            ],
            schedules: [
                { id: 1, class_id: 1, date: dateOffset(1), start_time: '08:00', end_time: '09:00', capacity: 20, status: 'open' },
                { id: 2, class_id: 2, date: dateOffset(2), start_time: '10:00', end_time: '11:00', capacity: 15, status: 'open' },
                { id: 3, class_id: 3, date: dateOffset(3), start_time: '14:00', end_time: '15:00', capacity: 12, status: 'open' },
                { id: 4, class_id: 4, date: dateOffset(4), start_time: '16:00', end_time: '17:00', capacity: 10, status: 'open' },
                { id: 5, class_id: 5, date: dateOffset(5), start_time: '18:00', end_time: '19:00', capacity: 12, status: 'open' }
            ],
            memberships: [
                { id: 1, user_id: 2, plan_id: 2, status: 'active', start_date: dateOffset(-10), end_date: dateOffset(20) },
                { id: 2, user_id: 3, plan_id: 1, status: 'active', start_date: dateOffset(-70), end_date: dateOffset(-5) }
            ],
            bookings: [
                { id: 1, user_id: 2, schedule_id: 1, status: 'confirmed' },
                { id: 2, user_id: 3, schedule_id: 2, status: 'pending' },
                { id: 3, user_id: 4, schedule_id: 3, status: 'confirmed' }
            ]
        };
    }

    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : seedState();
        } catch (error) { return seedState(); }
    }

    window.SERVER_HINT = ' Could not reach the server - start it with: php -S localhost:8000';

    window.apiCall = async function (method, file, body) {
        const options = { method: method, headers: {} };
        if (body !== undefined) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        let res;
        try {
            res = await fetch(API + file, options);
        } catch (networkError) {
            const error = new Error('Could not reach the server.');
            error.kind = 'network';
            throw error;
        }
        let data = null;
        try { data = await res.json(); } catch (parseError) {}
        if (!res.ok) {
            const error = new Error((data && data.error) || '');
            error.status = res.status;
            error.apiMessage = data && data.error ? String(data.error) : '';
            if (res.status === 401 && error.apiMessage === 'Please log in first.') {
                error.sessionExpired = true;
            }
            throw error;
        }
        return data;
    };

    window.esc = function (value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    window.peso = function (amount) {
        return '\u20B1' + Number(amount).toLocaleString('en-PH', { maximumFractionDigits: 0 });
    };
})();
