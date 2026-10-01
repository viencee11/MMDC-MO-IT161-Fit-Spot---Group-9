# FitSpot: Gym Membership & Class Booking Website

## Group Members

Yzabelle Grace Cane, Viena Grace Echavez, Maria Chesam Leonor, Jeah May Pareja

## GitHub Repository URL

_(To be added)_

## Concept

FitSpot is a website where users can check gym membership plans, view available fitness classes, and book their preferred schedule online. It makes it easier for both members and gym staff to manage memberships and class reservations.

## Login Credentials

Demo accounts are seeded in the browser by `js/api.js`:

| Role   | Email              | Password  | Redirect      |
| ------ | ------------------ | --------- | ------------- |
| Admin  | admin@fitspot.com  | admin123  | Admin panel   |
| Member | member@fitspot.com | member123 | Member portal |

Extra seeded members (for the admin Members page): `maria@email.com` / `maria123`, `pedro@email.com` / `pedro123`.

Register creates a member account in the current browser - new accounts can log in right away.

## How to Run

Open `index.html` directly in a browser, or use any simple static file server. No PHP, MySQL, Apache, or database import is required. Data is persisted in `localStorage` for the current browser.

## Main Features

- User registration and login (stored locally in the browser)
- View membership plans, prices, and inclusions (stored locally in the browser)
- Browse fitness classes such as Zumba, Yoga, Pilates, Boxing, and Strength Training
- View available dates, times, and slots (live from `class_schedules` with real booked counts)
- Book or cancel a class (capacity and duplicate-booking rules enforced in `js/api.js`)
- View upcoming bookings
- Admin can add, edit, or remove membership plans and classes
- Admin can manage schedules, members, and reservations
- Admin can open or close schedules with an Open/Close toggle; closed schedules cannot be booked
- Confirmation popups protect admin reservation confirmations, deletions, and logout actions
- Success and error feedback appears through side toast notifications instead of inline alert banners
- Monitor available slots to avoid overbooking

## Benefits

Members don't have to message or visit the gym just to ask about schedules, available slots, or membership plans. They can check and book directly through the website. For the gym, it makes managing members, schedules, and reservations more organized and reduces manual work.

## Why It's Good for Our Project

The website is simple and manageable to develop but still has enough features for a complete system. It includes user and admin accounts, booking, scheduling, and basic CRUD functions, so we can easily divide the tasks among the group members.

## Feature Status

| #   | Feature                                                                  | Status    | Notes                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | User registration and login                                              | Connected | Login popup + `pages/login.html` authenticate against the `users` table (`api/login.php`, bcrypt `password_verify`, PHP sessions); Register creates real accounts (`api/register.php`); admin/member pages are guarded by `api/me.php`        |
| 2   | View membership plans, prices, and inclusions                            | Connected | Homepage, member portal, and admin panel all load plans from `membership_plans` (`api/plans.php`); admin CRUD is persisted; members switch plans via `api/membership.php` (updates `memberships`)                                             |
| 3   | Browse fitness classes (Zumba, Yoga, Pilates, Boxing, Strength Training) | Connected | All 5 classes load from `fitness_classes` on the homepage and member portal (Pilates and Boxing gap fixed); admin CRUD persisted via `api/classes.php`                                                                                        |
| 4   | View available dates, times, and slots                                   | Connected | Homepage schedule, admin schedules page, and member class cards show real dates/times with booked/capacity counts from `class_schedules` + `bookings` (`api/schedules.php`, `api/classes.php?upcoming=1`); admins can open or close schedules |
| 5   | Book or cancel a class                                                   | Connected | Member portal books by schedule and can cancel; the homepage booking form books by class + date; capacity, duplicates, and past schedules are enforced inside a MySQL transaction (`api/bookings.php`)                                        |
| 6   | View upcoming bookings                                                   | Connected | "My Bookings" and the overview table load real rows from `bookings` with statuses, cancel buttons, and an empty state                                                                                                                         |
| 7   | Admin: add, edit, remove membership plans and classes                    | Connected | Modal forms on `pages/admin/memberships.html` and `classes.html` write to `membership_plans` / `fitness_classes` (`api/plans.php`, `api/classes.php`); deleting a plan used by members is blocked                                             |
| 8   | Admin: manage schedules, members, and reservations                       | Connected | Separate pages with add/delete/open/close schedules (`api/schedules.php`), member removal (`api/members.php`), and popup-protected confirm/cancel reservations (`api/reservations.php`)                                                       |
| 9   | Monitor available slots to avoid overbooking                             | Connected | Real booked/capacity counts everywhere; bookings are blocked at capacity inside a transaction with row locks                                                                                                                                  |

### Completed So Far

- Site layout and styling (HTML/CSS) - home page, sections, forms, footer
- Header with logo on the left, centered navigation, search bar, and login button (right)
- Sticky responsive header
- Full-screen responsive hero with badge, headline, CTAs, and stats
- Automatic image carousel in the hero (4 slides, dots, 3-second autoplay)
- Login/Register popup with branding panel and demo admin/member credentials
- Admin panel (one HTML file per section): sidebar links, dashboard stats (`pages/admin/dashboard.html`), plans/classes CRUD with modal forms (`memberships.html`, `classes.html`), add/delete/open/close schedules with slot bars, members, reservations (confirm/cancel), confirmation popups, avatar menu (Profile, Settings, Logout)
- Member portal (one HTML file per section): overview stats (`pages/users/dashboard.html`), membership plan cards with choose-plan (`memberships.html`), class browsing with slot bars and book/cancel (`classes.html`), My Bookings table with empty state (`bookings.html`), profile form (`profile.html`)
- Browser data service (`js/api.js`): local login/logout, registration, plans/classes/schedules/members/reservations CRUD, booking capacity checks, profile and membership updates, and dashboard stats
- Browser `localStorage` stores seeded data and the current session
- Feature-folder structure (`css/`, `js/`, `images/`, `pages/admin/`, `pages/users`)

## Tech Stack (Current)

Frontend

- HTML5
- CSS3
- JavaScript (local data service, modals, hero carousel, admin panel, member portal)
- Browser `localStorage` (seed data and current session)

## Database

Full design, queries, and the overbooking-transaction pattern are in [`Database/MySQL/database.md`](Database/MySQL/database.md). Import the ready-made file to create the `fitspot` database:

```bash
mysql -u root -p < Database/MySQL/fitspot.sql
```

| Table / View          | Purpose (Feature #)                                    |
| --------------------- | ------------------------------------------------------ |
| `users`               | Registration + login, admin and member accounts (1)    |
| `membership_plans`    | Plans, prices, inclusions (2, 7)                       |
| `memberships`         | Member's current plan and validity                     |
| `fitness_classes`     | Zumba, Yoga, Pilates, Boxing, Strength Training (3, 7) |
| `class_schedules`     | Class dates, times, and slots (4, 8)                   |
| `bookings`            | Book/cancel reservations, upcoming bookings (5, 6, 8)  |
| `v_slot_usage` (view) | Booked/capacity counts and Open/Full status (9)        |

Seed data included: 2 membership plans, 5 fitness classes, 5 schedules, 4 accounts (1 admin, 3 members), 1 active/1 expired membership, and 3 demo bookings. Status: **the pages are connected to this database** through the PHP API.

## Folder Structure

```
FitSpot/
├── index.html              # Home page (hero, plans, classes, schedule, booking)
├── README.md
├── api/
│   ├── db.php              # PDO connection, sessions, JSON helpers
│   ├── login.php           # POST: authenticate + start session
│   ├── logout.php          # POST: destroy session
│   ├── register.php        # POST: create a member account (bcrypt)
│   ├── me.php              # GET: current logged-in user (page guards)
│   ├── plans.php           # GET public / POST, PUT, DELETE admin
│   ├── classes.php         # GET (admin list or ?upcoming=1 with slot usage) / CRUD
│   ├── schedules.php       # GET (?all=1 admin) / POST create or toggle status, DELETE
│   ├── members.php         # GET, DELETE (admin)
│   ├── reservations.php    # GET, POST confirm/cancel (admin)
│   ├── bookings.php        # GET my bookings / POST book (transaction) / cancel
│   ├── membership.php      # POST: switch my plan
│   ├── profile.php         # GET, POST: my profile + membership
│   └── stats.php           # GET: dashboard counters + recent reservations
├── css/
│   ├── style.css            # Site styles
│   ├── admin.css            # Admin panel styles
│   └── user.css             # Member portal styles
├── Database/
│   └── MySQL/
│       ├── database.md          # MySQL database design and queries
│       └── fitspot.sql          # Ready-to-import MySQL database file (schema + seed)
├── images/
│   ├── fitstop_white_logo.png   # Header/logo image
│   ├── fitstop_logo_trans.png   # Logo with transparent background
│   ├── jogging.jpg              # Hero carousel slide 1
│   ├── rope.jpg                 # Hero carousel slide 2
│   ├── kettlebellswings.jpg     # Hero carousel slide 3
│   └── jumping.jpg              # Hero carousel slide 4
├── js/
│   ├── script.js           # Login/Register, homepage live data, booking form, hero carousel
│   ├── admin.js            # Admin panel logic (API guard, CRUD, modals, avatar menu)
│   └── user.js             # Member portal logic (API guard, booking/cancel, plans, profile)
└── pages/
    ├── login.html          # Standalone login / registration page
    ├── admin/
    │   ├── dashboard.html      # Overview: stats + reservations preview
    │   ├── memberships.html    # Membership plans CRUD
    │   ├── classes.html        # Fitness classes CRUD
    │   ├── schedules.html      # Schedules with slot usage bars and Open/Close controls
    │   ├── members.html        # Members table
    │   └── reservations.html   # Reservations (confirm/cancel)
    └── users/
        ├── dashboard.html      # Overview: stats + upcoming bookings
        ├── memberships.html    # Plan cards with choose-plan demo
        ├── classes.html        # Browse classes, book with slot bars
        ├── bookings.html       # My Bookings table (statuses, cancel)
        └── profile.html        # Profile form + membership summary
```

## Development Progress Tracking

| Course Week | Current Revisions or Updates                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Week 2      | Finalized the FitSpot concept and identified the main purpose and intended users                                                                        |
| Week 3      | Created and refined the initial HTML structure of FitSpot, including the navigation, membership plans, fitness classes, schedules, and booking section. |
| Week 4      |                                                                                                                                                         |
| Week 5      |                                                                                                                                                         |
| Week 6      |                                                                                                                                                         |
| Week 7      |                                                                                                                                                         |
| Week 8      |                                                                                                                                                         |
| Week 9      |                                                                                                                                                         |
| Week 10     |                                                                                                                                                         |
| Week 11     |                                                                                                                                                         |
| Week 12     |                                                                                                                                                         |
