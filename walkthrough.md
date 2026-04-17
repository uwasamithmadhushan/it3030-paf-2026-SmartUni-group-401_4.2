# Smart Campus Project - Walkthrough

## 1. Project Overview
A full-stack Smart Campus management solution using **React** for the frontend, **Spring Boot** for the backend, and **MongoDB** for the data store.

## 2. Infrastructure
- **Frontend**: Port 3000
- **Backend**: Port 8080
- **Database**: Port 27017 (Local MongoDB)

## 3. How to Run
### Start Backend
Navigate to the `backend` folder and run:
```powershell
./mvnw spring-boot:run
```

### Start Frontend
Navigate to the `campus-client` folder and run:
```powershell
npm install # if dependencies changed
npm start
```

## 4. Authentication
Existing administrative user:
- **Username**: `admin`
- **Password**: `Password123!`
- **Role**: `ADMIN`

## 5. RECENT ACTIONS
- Integrated premium UI design with Tailwind CSS and Lucide icons.
- Configured MongoDB and JWT security in the backend.
- Verified successful login and dashboard navigation.

---
*Last updated by Antigravity on April 16, 2026.*
