import { ArrowPathIcon } from '@heroicons/react/24/solid';

function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  fullWidth = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  ...props 
}) {
  const baseStyles = 'text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 relative';
  const activeStyles = !disabled && !isLoading 
    ? 'hover:shadow-lg transform hover:scale-105 duration-300' 
    : '';
  const fullWidthStyles = fullWidth ? 'w-full' : '';
  const disabledStyles = disabled || isLoading 
    ? 'opacity-70 cursor-not-allowed' 
    : 'cursor-pointer';

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-secondary hover:bg-secondary-dark';
      case 'accent':
        return 'bg-accent hover:bg-accent-dark';
      case 'primary':
      default:
        return 'bg-primary hover:bg-primary-dark';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      type={type}
      className={`${baseStyles} ${activeStyles} ${getVariantStyles()} ${fullWidthStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
          Loading...
        </span>
      ) : children}
    </button>
  );
}

export default Button; 