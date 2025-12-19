import { useState } from 'react';
import { COLORS } from '../constants/colors';

function Table({
  columns,
  data,
  searchable = false,
  sortable = false,
  onRowClick,
  actions = [],
  emptyMessage = 'कोई डेटा नहीं मिला',
  loading = false,
  className = ''
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter data based on search
  const filteredData = searchable && searchTerm
    ? data.filter((row) =>
      columns.some((col) => {
        const value = col.accessor ? col.accessor(row) : row[col.key];
        return value !== null && value !== undefined
          ? String(value).toLowerCase().includes(searchTerm.toLowerCase())
          : false;
      })
    )
    : data;

  // Sort data
  const sortedData = sortable && sortField
    ? [...filteredData].sort((a, b) => {
      const aValue = columns.find(col => col.key === sortField)?.accessor
        ? columns.find(col => col.key === sortField).accessor(a)
        : a[sortField];
      const bValue = columns.find(col => col.key === sortField)?.accessor
        ? columns.find(col => col.key === sortField).accessor(b)
        : b[sortField];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue.toString().localeCompare(bValue.toString(), 'hi', { numeric: true });
      return sortDirection === 'asc' ? comparison : -comparison;
    })
    : filteredData;

  const handleSort = (key) => {
    if (!sortable) return;

    if (sortField === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className={`w-full bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="p-2 sm:p-3 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 pl-9 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#E21E26] focus:ring-[#E21E26] transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm font-semibold text-gray-700 ${sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                    } ${column.className || ''}`}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortable && column.sortable !== false && sortField === column.key && (
                      <svg
                        className={`w-4 h-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm font-semibold text-gray-700">
                  कार्रवाई
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-3 sm:px-4 md:px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E21E26]"></div>
                    <p className="ml-3 text-sm sm:text-base text-gray-500">लोड हो रहा है...</p>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-3 sm:px-4 md:px-6 py-8 text-center">
                  <p className="text-sm sm:text-base text-gray-500">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`hover:bg-[#E21E26]/5 transition-colors duration-200 ${onRowClick ? 'cursor-pointer' : ''
                    }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : column.accessor
                          ? column.accessor(row)
                          : row[column.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-3 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${action.variant === 'danger'
                              ? 'text-red-600 hover:bg-red-50'
                              : action.variant === 'warning'
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-blue-600 hover:bg-blue-50'
                              }`}
                            title={action.label}
                          >
                            {action.icon || (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;

