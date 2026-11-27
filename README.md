# EduTrack | Genesis L. Narito, BSIT 4-A

NestJS + TypeORM + MySQL prototype implementing the Lab 03-06 attendance and academic performance design. Requires Node.js 24 and MySQL 8 or XAMPP MariaDB (tested on 10.4.32).

1. Run database/edutrack.sql in MySQL Workbench or the mysql client.
2. Copy .env.example to .env. Set database credentials and a random JWT secret of at least 32 characters.
3. Run npm ci, then npm run build.
4. In PowerShell, set `$env:ADMIN_EMAIL` and `$env:ADMIN_PASSWORD` temporarily (minimum 12 characters, six distinct characters). Run `node dist/main.js --seed-admin`, then clear both variables. Never commit credentials.
5. Run npm run start:dev. Import the Postman collection and set email/password locally. Log in as admin to provision profiles, courses, enrollments, and role-linked accounts. Update sample IDs to match the returned IDs. Log in as the assigned teacher to record or edit attendance and grades.
6. For the demo, start the server, log in, create/read/PATCH/delete a disposable student, trace the request through StudentsController -> ApiService -> TypeORM -> MySQL, run Missing token, and verify the test student is absent in MySQL. Use personal narration, 5-10 minutes.

The prototype binds to loopback. Put it behind an HTTPS reverse proxy for deployment, and replace process-local login rate limiting with a shared limiter for multiple instances. Email notification delivery is not implemented. Do not use real student information in the demo.

## Documentation

- [Final project documentation (PDF)](docs/EduTrack_Documentation.pdf)
- [Entity relationship diagram](docs/ERD.md)
- [Project documentation (Markdown)](docs/PROJECT-DOCUMENTATION.md)

### Automated API smoke test

With the local demo server running, temporarily set ADMIN_EMAIL and ADMIN_PASSWORD for your seeded administrator, then run `node scripts/smoke.cjs`. It exercises all 36 routes with synthetic data and retains two synthetic account/profile pairs. Use a demo database, never a production or school database.

- [Narrated demo run sheet](docs/DEMO.md)
