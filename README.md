# Graduation Invitation Web

Graduation invitation website built with:
- `Node.js + Express + MySQL`
- `React` for admin dashboard
- `HTML/CSS/JS` for user-facing pages

## Structure
- `backend/`: API, auth, uploads, static serving
- `frontend/admin/`: admin dashboard
- `frontend/user/`: landing page and invitation page
- `database/`: SQL schema samples
- `docs/`: project notes and references

## Run Locally
1. Import `database/graduation_invitation.sql` into MySQL.
2. Copy `backend/.env.example` to `backend/.env`.
3. Fill in your own database credentials and JWT secret.
4. Install dependencies:

```powershell
cd backend
npm install
```

5. Start the server:

```powershell
npm run dev
```

6. Open:
- User page: `http://localhost:5000/`
- Admin login: type `admin` on the landing page, then sign in with your admin account

## Main API
- `GET /api/invitation?name=...`
- `POST /api/login`
- `POST /api/wishes`
- `GET /api/admin/cards`
- `POST /api/admin/cards`
- `PUT /api/admin/cards/:id`
- `DELETE /api/admin/cards/:id`
- `GET /api/admin/wishes`

## GitHub Safety
- Do not commit `backend/.env`
- Replace all demo credentials before production use
- Replace `JWT_SECRET` with a long random value
- Use your own database credentials and admin accounts
