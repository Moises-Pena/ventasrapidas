import React, { useState, useEffect } from 'react';
import { Category } from '../types';

interface CategoryFormProps {
  onSubmit: (name: string) => void;
  category?: Category;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, category, onCancel }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const validate = (): boolean => {
    if (!name.trim()) {
      setError('El nombre de la categoría es requerido');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(name);
      setName('');
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
          Nombre de la Categoría
        </label>
        <input
          type="text"
          id="categoryName"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {category ? 'Actualizar' : 'Agregar'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;