import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-12">Hamara Samachar</h1>
        
        <div className="flex gap-8 justify-center flex-wrap">
          {/* User Box */}
          <div
            onClick={() => navigate('/user')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-64 h-64 flex flex-col items-center justify-center border-2 border-blue-200 hover:border-blue-500"
          >
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">User</h2>
            <p className="text-gray-500 text-sm">User Module</p>
          </div>

          {/* Admin Box */}
          <div
            onClick={() => navigate('/admin')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-64 h-64 flex flex-col items-center justify-center border-2 border-red-200 hover:border-red-500"
          >
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Admin</h2>
            <p className="text-gray-500 text-sm">Admin Module</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

