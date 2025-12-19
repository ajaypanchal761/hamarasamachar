import { COLORS } from '../constants/colors';

function Form({ children, onSubmit, className = '' }) {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
}

function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  disabled = false,
  autoComplete = 'off',
  rows,
  options = [],
  ...props
}) {
  const inputClasses = `w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-[#E21E26] focus:ring-[#E21E26]'
    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`;

  const selectClasses = `w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-[#E21E26] focus:ring-[#E21E26]'
    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`;

  return (
    <div className="mb-3 sm:mb-4">
      {label && (
        <label htmlFor={name} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows || 4}
          className={inputClasses}
          autoComplete={autoComplete}
          {...props}
        />
      ) : type === 'select' ? (
        <div className="relative">
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={selectClasses}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ) : type === 'color' ? (
        <div className="flex items-center gap-3">
          <input
            id={name}
            name={name}
            type="color"
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E21E26] focus:border-[#E21E26] transition-colors"
            {...props}
          />
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder="#000000"
            className={`flex-1 ${inputClasses}`}
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            disabled={disabled}
          />
        </div>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          inputMode={name === 'icon' ? 'emoji' : undefined}
          className={inputClasses}
          autoComplete={autoComplete}
          {...props}
        />
      )}

      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function FormActions({ children, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-3 ${className}`}>
      {children}
    </div>
  );
}

function FormButton({
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  children,
  className = '',
  ...props
}) {
  const baseClasses = 'px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'text-white',
    secondary: 'border-2 bg-transparent',
    danger: 'text-white'
  };

  const getStyle = () => {
    if (variant === 'primary') {
      return { backgroundColor: COLORS.header.bg };
    } else if (variant === 'secondary') {
      return {
        borderColor: COLORS.header.bg,
        color: COLORS.header.bg
      };
    } else if (variant === 'danger') {
      return { backgroundColor: '#DC2626' };
    }
    return {};
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={getStyle()}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (variant === 'primary') {
            e.target.style.backgroundColor = COLORS.button.primary.hover;
          } else if (variant === 'secondary') {
            e.target.style.backgroundColor = '#FEE2E2';
          } else if (variant === 'danger') {
            e.target.style.backgroundColor = '#B91C1C';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          if (variant === 'primary') {
            e.target.style.backgroundColor = COLORS.header.bg;
          } else if (variant === 'secondary') {
            e.target.style.backgroundColor = 'transparent';
          } else if (variant === 'danger') {
            e.target.style.backgroundColor = '#DC2626';
          }
        }
      }}
      {...props}
    >
      {loading ? 'लोड हो रहा है...' : children}
    </button>
  );
}

Form.Field = FormField;
Form.Actions = FormActions;
Form.Button = FormButton;

export default Form;

