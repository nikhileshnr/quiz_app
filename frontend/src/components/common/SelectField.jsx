function SelectField({ label, name, value, onChange, options, required = false }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField; 