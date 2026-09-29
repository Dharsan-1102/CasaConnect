# CasaConnect 🏡

CasaConnect is a comprehensive Society and Apartment Management System designed to simplify the daily operations of residential communities. Built as a collaborative college project, this application provides dedicated interfaces for Residents, Guards, Maintenance staff, and Administrators to ensure seamless communication and facility management.

## Features ✨
- **Admin Dashboard**: Manage societies, apartments, and users (residents, guards, maintenance).
- **Resident Portal**: Book amenities, track maintenance issues, view bills, and manage profiles.
- **Guard Panel**: Track visitor entries and check-outs securely.
- **Maintenance Interface**: Update and resolve resident issues efficiently.
- **Role-Based Authentication**: Secure login and access control powered by JWT.
- **Notifications & Notices**: Real-time updates and community announcements.

## Tech Stack 💻
- **Frontend**: React.js, Vite, Axios, CSS Modules/Styles
- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT & bcrypt
- **File Storage**: Cloudinary (for profile photos)

## Installation & Setup 🚀

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/casaconnect.git
   cd casaconnect
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd Backend
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `Backend/` directory and configure the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

5. **Run the Application:**
   - **Start the Backend:**
     ```bash
     cd Backend
     node index.js
     ```
   - **Start the Frontend:** (Open a new terminal at the root)
     ```bash
     npm run dev
     ```

## Team Members 👥
- [Add Team Member 1 Name/GitHub]
- [Add Team Member 2 Name/GitHub]
- [Add Team Member 3 Name/GitHub]
- [Add Team Member 4 Name/GitHub]

## License 📄
This project was developed for educational purposes.
