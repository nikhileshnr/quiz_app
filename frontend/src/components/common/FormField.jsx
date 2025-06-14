function FormField({ label, name, type = 'text', value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      />
    </div>
  );
}

export default FormField; 