# CasaConnect Backend API 🚀

This backend powers the CasaConnect Society Management System. It is built using **Node.js, Express, and MongoDB**.

## Architecture & Structure
We are actively adopting a **Model-View-Controller (MVC)** architectural pattern to ensure scalability and maintainability.

### Directory Layout
- **`config/`**: Contains database connections (MongoDB) and third-party service setups (Cloudinary).
- **`controllers/`**: Houses the core business logic and request handlers for each route.
- **`middlewares/`**: Contains custom Express middlewares, such as JWT authentication (`auth.js`) and rate-limiting.
- **`models/`**: Defines the Mongoose schemas for our database entities (Users, Apartments, Bills, etc.).
- **`routes/`**: Defines the Express API endpoints and maps them to their respective controllers.
- **`utils/`**: Shared helper functions and generic utilities.

## Core Services
- **Authentication**: JWT-based secure login with bcrypt password hashing.
- **Email Service**: OTP verification and notifications powered by Nodemailer.
- **File Uploads**: Direct image uploads to Cloudinary for user profiles and event posters.
- **Security**: Express rate-limiting to prevent brute-force attacks on OTP endpoints.
