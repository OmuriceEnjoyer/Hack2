import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-purple-400 font-bold tracking-wide text-sm">
          TropelCare Control Room
        </span>
        <Link
          to="/dashboard"
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Dashboard
        </Link>
        <Link
          to="/tropels"
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Tropeles
        </Link>
        <Link
          to="/signals"
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Señales
        </Link>
        <Link
          to="/sectors"
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Sectores
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-500 text-xs">{user?.teamCode}</span>
        <span className="text-gray-300 text-sm">{user?.displayName}</span>
        <button
          onClick={handleLogout}
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
