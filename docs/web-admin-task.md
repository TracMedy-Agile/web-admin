## Admin endpoints shipped for Phase 13B

_Base path:_ `/api/v1/admin`  
_Login:_ `POST /api/v1/auth/admin/login`

### Auth / shell / dashboard

- [x] `POST /api/v1/auth/admin/login` - connected - sign in admin
- [x] `POST /api/v1/admin/forgot-password` - connected - request reset link
- [x] `POST /api/v1/admin/reset-password` - connected - reset password, revoke old sessions
- [x] `GET /api/v1/admin/me` - connected - hydrate logged-in admin profile
- [x] `GET /api/v1/admin/dashboard/overview` - connected - shared overview helper; dashboard UI awaits design

### Users management

- [x] `GET /api/v1/admin/users/summary` - connected - top user stats/counts for users screen
- [x] `GET /api/v1/admin/users` - connected - list/search/filter users
- [x] `GET /api/v1/admin/users/export` - connected - secure export proxy
- [x] `GET /api/v1/admin/users/:id` - connected - user detail drawer
- [x] `PATCH /api/v1/admin/users/:id/status` - connected - suspend/reactivate user

### Facilities management

- [x] `GET /api/v1/admin/facilities/summary` - connected - top facility stats/counts
- [x] `GET /api/v1/admin/facilities` - connected - list/search/filter facilities
- [x] `POST /api/v1/admin/facilities` - connected - register/onboard facility
- [x] `GET /api/v1/admin/facilities/export` - connected - secure export proxy
- [x] `GET /api/v1/admin/facilities/:id` - connected - facility detail view
- [x] `PATCH /api/v1/admin/facilities/:id/status` - connected - suspend/reactivate facility

### Security/session

- [ ] `POST /api/v1/auth/logout-all` - revoke all active sessions for current user
