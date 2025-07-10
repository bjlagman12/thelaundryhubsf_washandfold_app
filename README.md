# The Laundry Hub SF – Wash & Fold App

This app is designed for **The Laundry Hub SF** to receive, track, and manage wash & fold orders online.

Customers can schedule drop-offs, enter contact details, and select their laundry service preferences. The app guides users through a simple multi-step process, sends order confirmations via SMS, and ensures a seamless laundry drop-off experience.

Admins (staff) have a secure login to view and manage incoming orders.

---

## 🚀 Try It Out

- **Order laundry service (Customer Portal):**  
  [https://thelaundryhubsf.web.app/form](https://thelaundryhubsf.web.app/form)

- **Admin portal (Staff Only):**  
  [https://thelaundryhubsf.web.app/authenticate](https://thelaundryhubsf.web.app/authenticate)

---

## ✨ Features

- **Customer Workflow**

  - Service selection (Premium or Basic)
  - Date & time slot picker
  - Multi-step form with validation
  - Review & confirm before submission
  - SMS confirmation with unique order ID

- **Admin Portal**

  - Secure login via Firebase Authentication
  - View, filter, and update order status
  - Add notes and track order progress

- **Tech Stack**
  - **Frontend:** React, React Hook Form, Tailwind CSS
  - **Backend & Auth:** Firebase Authentication, Firestore
  - **Deployment:** Firebase Hosting

---

## 📽️ Demo Video

> _Watch a quick walkthrough of the app in action:_  
> [▶️ Download or view the demo video](./thelaundryhubSFwnfapp.mov)

---

## 🛠️ Running Locally

> _This is optional—most users can use the hosted site above._

1. **Clone the repository**

   ```bash
   git clone https://github.com/bjlagman12/thelaundryhubsf_washandfold_app.git
   cd thelaundryhubsf_washandfold_app

   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a .env file in the project root and add your Firebase config:**

   ```bash
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   ```

4. **Start the development server**
   ```bash
    npm run dev

   ```

The app will be available at http://localhost:5173.
