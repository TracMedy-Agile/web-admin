# Web Admin Known Gaps

Phase 01 authentication designs and Phase 02 Users designs are available. The following admin areas are intentionally not built yet because there are no matching design files in docs/design/:

- Dashboard overview beyond the minimal protected landing route
- Hospital/facility management
- Role administration beyond the Users screen navigation item
- Waitlist management and CSV export
- Platform configuration
- Audit log viewer
- System monitoring and analytics
- Billing/subscription administration

The current backend contract also does not expose dedicated admin user list, user profile, suspend, activate, or deactivate endpoints. The Users screen keeps this data path isolated for later wiring.
