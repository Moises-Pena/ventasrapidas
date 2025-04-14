import React from 'react';
import { Category } from '../types';
import { Edit, Trash2 } from 'lucide-react';
import Pagination from './Pagination';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

/**
 * Componente que muestra una tabla con la lista de categorías.
 * Incluye paginación y botones para editar o eliminar cada categoría.
 */
const CategoryList: React.FC<CategoryListProps> = ({ 
  categories, 
  onEdit, 
  onDelete 
}) => {
  /**
   * Estado que mantiene la página actual mostrada en la tabla.
   */
  const [currentPage, setCurrentPage] = React.useState(1);

  /**
   * Cantidad de elementos mostrados por página.
   */
  const pageSize = 10;

  /**
   * Calcula el número total de páginas según la cantidad de categorías y el tamaño de página.
   */
  const totalPages = Math.ceil(categories.length / pageSize);

  /**
   * Índice de inicio para el corte del arreglo según la página actual.
   */
  const startIndex = (currentPage - 1) * pageSize;

  /**
   * Índice de fin para el corte del arreglo según la página actual.
   */
  const endIndex = startIndex + pageSize;

  /**
   * Arreglo de categorías que se mostrarán en la página actual.
   */
  const displayedCategories = categories.slice(startIndex, endIndex);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nombre
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayedCategories.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                No hay categorías registradas
              </td>
            </tr>
          ) : (
            // Mapea y renderiza cada categoría como una fila de la tabla, con opciones de edición y eliminación
            displayedCategories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(category)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(category.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryList;
