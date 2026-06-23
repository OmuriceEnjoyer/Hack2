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
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex flex-wrap items-center justify-between gap-y-2">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-purple-400 font-bold tracking-wide text-sm whitespace-nowrap">
          TropelCare
        </span>
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/dashboard" className="text-gray-400 hover:text-white text-xs transition-colors">Dashboard</Link>
          <Link to="/tropels" className="text-gray-400 hover:text-white text-xs transition-colors">Tropeles</Link>
          <Link to="/signals" className="text-gray-400 hover:text-white text-xs transition-colors">Señales</Link>
          <Link to="/sectors" className="text-gray-400 hover:text-white text-xs transition-colors">Sectores</Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-xs hidden sm:inline">{user?.teamCode}</span>
        <span className="text-gray-300 text-xs">{user?.displayName}</span>
        <button
          onClick={handleLogout}
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1.5 rounded transition-colors whitespace-nowrap"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
