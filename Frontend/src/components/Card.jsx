const Card = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`relative group bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 transition-all duration-500 hover:shadow-3xl hover:border-blue-300/50 dark:hover:border-blue-600/50 hover:-translate-y-1 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-3xl transition-all duration-500 pointer-events-none"></div>
      <div className="relative z-10">
        {(title || subtitle) && (
          <div className="mb-6 pb-6 border-b-2 border-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700">
            {title && (
              <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent leading-tight tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-3 leading-relaxed font-medium">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Card;