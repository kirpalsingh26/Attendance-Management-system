import { Link } from 'react-router-dom';
import { CheckSquare, Calendar, BarChart3, Users, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 top-1/4 -right-48 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-96 h-96 -bottom-48 left-1/3 bg-pink-400/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <CheckSquare className="w-8 h-8 text-blue-600 dark:text-blue-400 relative transition-transform group-hover:scale-110 group-hover:rotate-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Attendance Pro
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold hover:-translate-y-0.5"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20 lg:py-28 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-8 border border-blue-200/50 dark:border-blue-800/30 animate-fade-in">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Smart Attendance Management</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 dark:text-white mb-8 animate-fade-in leading-tight tracking-tight">
          <span className="block text-3xl sm:text-4xl md:text-5xl mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">Manage Your</span>
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
              College Attendance
            </span>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 blur-3xl opacity-30 -z-10 animate-pulse"></div>
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed px-4 animate-slide-in">
          Track your classes, mark attendance with a single click, and visualize your 
          academic progress with <span className="font-semibold text-blue-600 dark:text-blue-400">powerful analytics</span>.
        </p>
        
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 mb-12 animate-scale-in">
            <Link
              to="/register"
              className="group flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-lg font-semibold shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1"
            >
              <span>Start Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 text-lg font-semibold shadow-xl hover:-translate-y-1"
            >
              Login
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto mt-20 animate-fade-in">
          <div className="group p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">99%</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Accuracy</div>
          </div>
          <div className="group p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">10k+</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Students</div>
          </div>
          <div className="group p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-pink-600 via-orange-600 to-pink-700 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">24/7</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Access</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20 lg:py-28 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full mb-4 border border-purple-200/50 dark:border-purple-800/30">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Powerful Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            All the tools you need to manage your college attendance efficiently
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <FeatureCard
            icon={<Calendar className="w-12 h-12" />}
            title="Smart Timetable"
            description="Create and manage your college timetable with ease. Add subjects, timings, and teachers."
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={<CheckSquare className="w-12 h-12" />}
            title="Quick Attendance"
            description="Mark attendance with intuitive tick and cross interactions. Fast and hassle-free."
            gradient="from-green-500 to-emerald-500"
          />
          <FeatureCard
            icon={<BarChart3 className="w-12 h-12" />}
            title="Visual Analytics"
            description="Track your attendance percentage with interactive charts and detailed insights."
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={<Users className="w-12 h-12" />}
            title="Subject Tracking"
            description="Monitor attendance for each subject separately with real-time percentage updates."
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* Additional Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
          <BenefitCard
            icon={<Zap className="w-8 h-8" />}
            title="Lightning Fast"
            description="Mark attendance in seconds with our optimized interface"
          />
          <BenefitCard
            icon={<Shield className="w-8 h-8" />}
            title="Secure & Private"
            description="Your data is encrypted and stored securely"
          />
          <BenefitCard
            icon={<Sparkles className="w-8 h-8" />}
            title="Smart Insights"
            description="AI-powered analytics for better performance"
          />
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="container mx-auto px-4 py-16 sm:py-20 relative z-10">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 sm:p-16 text-center text-white overflow-hidden shadow-2xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Ready to Take Control?
              </h2>
              <p className="text-xl sm:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of students managing their attendance efficiently
              </p>
              <Link
                to="/register"
                className="group inline-flex items-center space-x-2 px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all duration-300 text-lg font-bold shadow-2xl hover:shadow-white/50 hover:-translate-y-1"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <p className="mt-6 text-sm opacity-75">No credit card required • Free forever</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center relative z-10">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Attendance Pro
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            &copy; 2026 Attendance Pro. Built for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, gradient }) => {
  return (
    <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:-translate-y-2">
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
      
      <div className="relative z-10">
        <div className={`inline-flex p-4 bg-gradient-to-br ${gradient} rounded-2xl mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg`}>
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const BenefitCard = ({ icon, title, description }) => {
  return (
    <div className="flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white shadow-lg">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default Landing;
