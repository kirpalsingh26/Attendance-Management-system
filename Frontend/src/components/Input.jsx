const Input = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group flex items-center">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-blue-500 group-focus-within:scale-110 z-10">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3.5 border-2 rounded-2xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl
            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
            dark:border-gray-600 dark:text-white
            transition-all duration-300 shadow-lg hover:shadow-xl
            font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${icon ? 'pl-12' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2.5 text-sm text-red-600 dark:text-red-400 font-semibold flex items-center animate-slide-in">
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
