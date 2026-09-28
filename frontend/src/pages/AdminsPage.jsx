import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555';

// Lists both kinds of admin (local: username+password, invited: name+email
// only, Google sign-in). The token is attached automatically by the axios
// interceptor set up in api/axiosSetup.js.
const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const loadAdmins = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin`);
      setAdmins(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admins');
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API_URL}/admin/invite`, { name, email });
      setSuccess(`Invited ${email} - they can now sign in with Google`);
      setName('');
      setEmail('');
      loadAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite admin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <h1 className="text-2xl font-semibold">Admins</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-8 space-y-8">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Invite an admin (Google sign-in only)</h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          {success && <p className="text-green-600 mb-2">{success}</p>}
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Add
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">All admins</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Name / Username</th>
                <th className="py-2">Email</th>
                <th className="py-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} className="border-b last:border-0">
                  <td className="py-2">{admin.username || admin.name}</td>
                  <td className="py-2">{admin.email || '-'}</td>
                  <td className="py-2">
                    <span
                      className={
                        admin.username
                          ? 'bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm'
                          : 'bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm'
                      }
                    >
                      {admin.username ? 'Local' : 'Invited (Google)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default AdminsPage;
