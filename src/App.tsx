import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CustomerForm from "./components/CustomerForm";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { Helmet } from "react-helmet";
import { AuthProvider } from "./context/AuthContext";
import RafflePage from "./components/RafflePage";
import MaterialHours from "./components/MaterialHours";

const NotFound = () => (
  <>
    <Helmet>
      <title>404 Not Found | The Laundry Hub SF</title>
      <meta name="description" content="Page not found." />
    </Helmet>
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-700">404 - Page Not Found</h1>
    </main>
  </>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <title>The Laundry Hub SF</title>
          <meta
            name="description"
            content="San Francisco's best wash & fold laundry service."
          />
        </Helmet>
        <Routes>
          <Route path="/" element={<Navigate to="/form" replace />} />
          <Route path="/form" element={<CustomerForm />} />
          <Route path="/raffle" element={<RafflePage />} />
          <Route path="/material-hours" element={<MaterialHours />} />
          <Route path="/admin" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
