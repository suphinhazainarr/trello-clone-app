import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Users, Zap, Shield, Globe } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Trello</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Get Trello for free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Trello brings all your tasks, teammates, and tools together
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Keep everything in the same place—even if your team isn't.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Sign up - it's free!</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 transition-colors text-lg font-semibold"
              >
                Already have an account? Log in
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl mx-auto">
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Trello board example"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              It's more than work. It's a way of working together.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with a Trello board, lists, and cards. Customize and expand with more features as your teamwork grows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Boards</h3>
              <p className="text-gray-600">
                Trello boards keep tasks organized and work moving forward. In a glance, see everything from "things to do" to "aww yeah, we did it!"
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lists</h3>
              <p className="text-gray-600">
                The different stages of a task. Start as simple as To Do, Doing or Done—or build a workflow custom fit to your team's needs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cards</h3>
              <p className="text-gray-600">
                Cards represent tasks and ideas and hold all the information to get the job done. As you make progress, move cards across lists to show their status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose the plan that's right for your team
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-transparent">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">$0</p>
              <p className="text-gray-600 mb-6">For individuals or teams looking to organize any project.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Personal boards</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Lists and cards</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Mobile apps</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors block text-center"
              >
                Get started
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard</h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">$5</p>
              <p className="text-gray-600 mb-6">Per user/month if billed annually ($6 billed monthly)</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Unlimited personal boards</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Advanced checklists</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors block text-center"
              >
                Start free trial
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-transparent">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">$10</p>
              <p className="text-gray-600 mb-6">Per user/month if billed annually ($12 billed monthly)</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Everything in Standard</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Calendar view</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Dashboard view</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors block text-center"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-2xl font-bold">Trello</span>
              </div>
              <p className="text-gray-400">
                Collaborate, manage projects, and reach new productivity peaks.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Boards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Lists</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Getting Started</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Developers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Trello Clone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;