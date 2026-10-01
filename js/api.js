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

    let state = loadState();
    function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    function fail(message, status) {
        const error = new Error(message);
        error.status = status || 400;
        error.apiMessage = message;
        if (error.status === 401 && message === 'Please log in first.') error.sessionExpired = true;
        throw error;
    }
    function currentUser() {
        const id = Number(localStorage.getItem(SESSION_KEY));
        return state.users.find(function (user) { return user.id === id; }) || null;
    }
    function requireUser(role) {
        const user = currentUser();
        if (!user) fail('Please log in first.', 401);
        if (role && user.role !== role) fail('You do not have access to this action.', 403);
        return user;
    }
    function statusInfo(status) {
        return status === 'confirmed'
            ? { label: 'Confirmed', color: 'badge-green' }
            : status === 'cancelled'
                ? { label: 'Cancelled', color: 'badge-gray' }
                : { label: 'Pending', color: 'badge-orange' };
    }
    function classFor(schedule) { return state.classes.find(function (item) { return item.id === schedule.class_id; }); }
    function scheduleFor(id) { return state.schedules.find(function (item) { return item.id === Number(id); }); }
    function bookedCount(scheduleId) {
        return state.bookings.filter(function (booking) {
            return booking.schedule_id === scheduleId && booking.status !== 'cancelled';
        }).length;
    }
    function displayTime(value) {
        const parts = value.split(':');
        const hour = Number(parts[0]);
        return (hour % 12 || 12) + ':' + parts[1] + ' ' + (hour >= 12 ? 'PM' : 'AM');
    }
    function scheduleLabel(schedule) {
        const date = new Date(schedule.date + 'T00:00:00');
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
            ' | ' + displayTime(schedule.start_time) + ' - ' + displayTime(schedule.end_time);
    }
    function planForUser(userId) {
        const membership = state.memberships.find(function (item) { return item.user_id === userId && item.status === 'active'; });
        return membership ? state.plans.find(function (plan) { return plan.id === membership.plan_id; }) : null;
    }
    function bookingView(booking) {
        const schedule = scheduleFor(booking.schedule_id);
        const fitnessClass = schedule && classFor(schedule);
        const info = statusInfo(booking.status);
        return { id: booking.id, schedule_id: booking.schedule_id, class_name: fitnessClass ? fitnessClass.name : 'Deleted class', schedule: schedule ? scheduleLabel(schedule) : '', status: booking.status, status_label: info.label, status_color: info.color, is_upcoming: Boolean(schedule && schedule.date >= dateOffset(0) && booking.status !== 'cancelled') };
    }
    function profileView(user) {
        const membership = state.memberships.find(function (item) { return item.user_id === user.id && item.status === 'active'; });
        const plan = membership && state.plans.find(function (item) { return item.id === membership.plan_id; });
        let membershipView = null;
        if (membership && plan) {
            const expired = membership.end_date < dateOffset(0);
            const end = new Date(membership.end_date + 'T00:00:00');
            const days = Math.max(0, Math.ceil((end - new Date(dateOffset(0) + 'T00:00:00')) / 86400000));
            membershipView = { plan: plan.name, price: plan.price, status: expired ? 'expired' : 'active', start_date: membership.start_date, end_date: membership.end_date, days_left: days };
        }
        return { id: user.id, full_name: user.full_name, email: user.email, role: user.role, phone: user.phone, address: user.address, created_at: user.created_at, membership: membershipView };
    }
    function scheduleView(schedule) {
        const fitnessClass = classFor(schedule);
        const booked = bookedCount(schedule.id);
        const status = schedule.status === 'open' && booked < schedule.capacity ? 'open' : schedule.status === 'cancelled' ? 'cancelled' : 'full';
        return { schedule_id: schedule.id, class_id: schedule.class_id, class_name: fitnessClass ? fitnessClass.name : 'Deleted class', name: fitnessClass ? fitnessClass.name : 'Deleted class', description: fitnessClass ? fitnessClass.description : '', date: schedule.date, schedule: scheduleLabel(schedule), booked: booked, capacity: schedule.capacity, remaining: Math.max(0, schedule.capacity - booked), percent: Math.min(100, Math.round(booked / schedule.capacity * 100)), status: status, status_label: status === 'open' ? 'Open' : status === 'full' ? 'Full' : 'Closed', status_color: status === 'open' ? 'badge-green' : status === 'full' ? 'badge-orange' : 'badge-gray', badge_label: status === 'open' ? 'Open' : status === 'full' ? 'Full' : 'Closed', badge_color: status === 'open' ? 'badge-green' : status === 'full' ? 'badge-orange' : 'badge-gray' };
    }

    window.apiCall = async function (method, file, body) {
        const endpoint = file.split('?')[0];
        const query = new URLSearchParams(file.split('?')[1] || '');
        let user, item, id;
        if (endpoint === 'login.php' && method === 'POST') {
            user = state.users.find(function (entry) { return entry.email === String(body.email).toLowerCase() && entry.password === body.password; });
            if (!user) fail('Invalid email or password.', 401);
            localStorage.setItem(SESSION_KEY, String(user.id));
            return { id: user.id, role: user.role };
        }
        if (endpoint === 'register.php' && method === 'POST') {
            if (!body.full_name || !body.email || !body.password) fail('Please complete all required fields.');
            if (body.password.length < 6) fail('Password must be at least 6 characters.');
            if (state.users.some(function (entry) { return entry.email === body.email.toLowerCase(); })) fail('An account with that email already exists.', 409);
            id = state.next.user++;
            state.users.push({ id: id, full_name: body.full_name, email: body.email.toLowerCase(), password: body.password, role: 'member', phone: '', address: '', created_at: dateOffset(0) });
            saveState(); return { id: id };
        }
        if (endpoint === 'logout.php') { localStorage.removeItem(SESSION_KEY); return { ok: true }; }
        if (endpoint === 'me.php') return profileView(requireUser());
        if (endpoint === 'plans.php' && method === 'GET') return { plans: state.plans.filter(function (plan) { return plan.is_active; }) };
        if (endpoint === 'classes.php' && method === 'GET' && query.get('upcoming') === '1') {
            user = requireUser('member');
            return { schedules: state.schedules.filter(function (schedule) { return schedule.date >= dateOffset(0); }).map(function (schedule) { const view = scheduleView(schedule); const mine = state.bookings.find(function (booking) { return booking.user_id === user.id && booking.schedule_id === schedule.id && booking.status !== 'cancelled'; }); view.my_status = mine ? mine.status : null; return view; }) };
        }
        if (endpoint === 'classes.php' && method === 'GET') return { classes: state.classes.filter(function (fitnessClass) { return fitnessClass.is_active; }).map(function (fitnessClass) { const next = state.schedules.filter(function (schedule) { return schedule.class_id === fitnessClass.id && schedule.date >= dateOffset(0) && schedule.status === 'open'; }).sort(function (a, b) { return a.date.localeCompare(b.date); })[0]; return Object.assign({}, fitnessClass, { next_schedule: next ? scheduleLabel(next) : null }); }) };
        if (endpoint === 'schedules.php' && method === 'GET') return { schedules: state.schedules.filter(function (schedule) { return query.get('all') === '1' || (schedule.date >= dateOffset(0) && schedule.status !== 'cancelled'); }).map(scheduleView) };
        if (endpoint === 'bookings.php' && method === 'GET') return { bookings: state.bookings.filter(function (booking) { return booking.user_id === requireUser('member').id; }).map(bookingView) };
        if (endpoint === 'profile.php' && method === 'GET') return profileView(requireUser());
        if (endpoint === 'stats.php' && method === 'GET') { requireUser('admin'); return { stats: { total_members: state.users.filter(function (entry) { return entry.role === 'member'; }).length, total_plans: state.plans.filter(function (entry) { return entry.is_active; }).length, total_classes: state.classes.filter(function (entry) { return entry.is_active; }).length, pending_reservations: state.bookings.filter(function (entry) { return entry.status === 'pending'; }).length }, recent: state.bookings.slice().reverse().slice(0, 5).map(function (booking) { const view = bookingView(booking); const member = state.users.find(function (entry) { return entry.id === booking.user_id; }); return { member: member ? member.full_name : 'Unknown', class_name: view.class_name, schedule: view.schedule, status_label: view.status_label, status_color: view.status_color }; }) }; }
        if (endpoint === 'members.php' && method === 'GET') { requireUser('admin'); return { members: state.users.filter(function (entry) { return entry.role === 'member'; }).map(function (entry) { const plan = planForUser(entry.id); const membership = state.memberships.find(function (item) { return item.user_id === entry.id && item.status === 'active'; }); const active = membership && membership.end_date >= dateOffset(0); return { id: entry.id, full_name: entry.full_name, email: entry.email, plan: plan ? plan.name : 'No plan', status_label: active ? 'Active' : 'No membership', status_color: active ? 'badge-green' : 'badge-gray' }; }) }; }
        if (endpoint === 'reservations.php' && method === 'GET') { requireUser('admin'); return { reservations: state.bookings.map(function (booking) { const view = bookingView(booking); const member = state.users.find(function (entry) { return entry.id === booking.user_id; }); return { id: booking.id, member: member ? member.full_name : 'Unknown', class_name: view.class_name, schedule: view.schedule, status: view.status, status_label: view.status_label, status_color: view.status_color }; }) }; }
        if (endpoint === 'plans.php' && ['POST', 'PUT', 'DELETE'].indexOf(method) !== -1) { requireUser('admin');
            if (method === 'DELETE') { if (state.memberships.some(function (membership) { return membership.plan_id === Number(body.id); })) fail('This plan is currently used by a member.'); state.plans = state.plans.filter(function (plan) { return plan.id !== Number(body.id); }); saveState(); return { id: Number(body.id) }; }
            if (!body.name || body.price === '' || !body.inclusions) fail('Please fill in all fields.');
            if (method === 'POST') { id = state.next.plan++; state.plans.push({ id: id, name: body.name, price: Number(body.price), inclusions: body.inclusions, is_active: 1 }); }
            else { item = state.plans.find(function (plan) { return plan.id === Number(body.id); }); if (!item) fail('Plan not found.', 404); Object.assign(item, { name: body.name, price: Number(body.price), inclusions: body.inclusions }); id = item.id; }
            saveState(); return { id: id };
        }
        if (endpoint === 'classes.php' && ['POST', 'PUT', 'DELETE'].indexOf(method) !== -1) { requireUser('admin');
            if (method === 'DELETE') { state.classes = state.classes.filter(function (entry) { return entry.id !== Number(body.id); }); state.schedules = state.schedules.filter(function (schedule) { return schedule.class_id !== Number(body.id); }); saveState(); return { id: Number(body.id) }; }
            if (!body.name || Number(body.capacity) < 1) fail('Please fill in all fields.');
            if (method === 'POST') { id = state.next.fitnessClass++; state.classes.push({ id: id, name: body.name, description: body.description || '', capacity: Number(body.capacity), is_active: 1 }); }
            else { item = state.classes.find(function (entry) { return entry.id === Number(body.id); }); if (!item) fail('Class not found.', 404); Object.assign(item, { name: body.name, description: body.description || '', capacity: Number(body.capacity) }); id = item.id; }
            saveState(); return { id: id };
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
