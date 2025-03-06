import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getAllUsers, updateUserPin } from '../firebase/services';
import { Key, Save, UserCog } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleEditUser = (userId: string) => {
    setEditingUser(userId);
    setNewPin('');
    setConfirmPin('');
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewPin('');
    setConfirmPin('');
    setError('');
  };

  const handleSavePin = async (userId: string) => {
    // Validate PIN
    if (newPin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Los PINs no coinciden');
      return;
    }

    try {
      setLoading(true);
      await updateUserPin(userId, newPin);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, pin: newPin } : user
      ));
      
      setSuccess('PIN actualizado correctamente');
      setEditingUser(null);
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      console.error('Error updating PIN:', error);
      setError('Error al actualizar el PIN');
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-lg font-medium text-gray-900 flex items-center">
            <UserCog className="h-5 w-5 mr-2 text-blue-500" />
            Gestión de Usuarios
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los PINs de acceso para los usuarios del sistema
          </p>
        </div>

        {success && (
          <div className="mx-6 mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PIN
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role === 'admin' ? 'Administrador' : 'Cajero'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingUser === user.id ? (
                        <div className="space-y-2">
                          <div>
                            <label htmlFor={`pin-${user.id}`} className="block text-xs font-medium text-gray-700">
                              Nuevo PIN
                            </label>
                            <input
                              type="password"
                              id={`pin-${user.id}`}
                              value={newPin}
                              onChange={(e) => {
                                setNewPin(e.target.value);
                                setError('');
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              placeholder="Nuevo PIN"
                              maxLength={6}
                            />
                          </div>
                          <div>
                            <label htmlFor={`confirm-pin-${user.id}`} className="block text-xs font-medium text-gray-700">
                              Confirmar PIN
                            </label>
                            <input
                              type="password"
                              id={`confirm-pin-${user.id}`}
                              value={confirmPin}
                              onChange={(e) => {
                                setConfirmPin(e.target.value);
                                setError('');
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              placeholder="Confirmar PIN"
                              maxLength={6}
                            />
                          </div>
                          {error && <p className="text-xs text-red-600">{error}</p>}
                        </div>
                      ) : (
                        <span>••••••</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingUser === user.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleSavePin(user.id)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditUser(user.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Key className="h-4 w-4 mr-1" />
                          Cambiar PIN
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay usuarios registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;