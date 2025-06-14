function Card({ children, className = '', disableHover = false }) {
  const baseStyles = 'bg-white p-8 rounded-lg shadow-md text-center flex flex-col items-center';
  const hoverStyles = 'transition-transform transform hover:scale-105 hover:shadow-xl duration-300';

  return (
    <div className={`${baseStyles} ${!disableHover && hoverStyles} ${className}`}>
      {children}
    </div>
  );
}

export default Card; 