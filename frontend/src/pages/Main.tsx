import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaAward } from 'react-icons/fa';

const platforms = [
  { name: 'LinkedIn', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg', alt: 'LinkedIn logo', url: 'https://www.linkedin.com/' },
  { name: 'Instagram', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg', alt: 'Instagram logo', url: 'https://www.instagram.com/' },
  { name: 'Twitter', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg', alt: 'Twitter logo', url: 'https://twitter.com/' },
  { name: 'Facebook', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg', alt: 'Facebook logo', url: 'https://facebook.com/' },
];

const features = [
  {
    title: 'AI Content & Image Generation',
    desc: 'Use our AI to generate engaging posts and stunning images tailored to your brand and audience.',
    icon: '🧠',
  },
  {
    title: 'Multi-Platform Integration',
    desc: 'Connect LinkedIn, Instagram, Twitter, and more. Schedule and publish content across all your channels from one dashboard.',
    icon: '🔗',
  },
  {
    title: 'Media Library',
    desc: 'Upload, organize, and reuse your images and videos. AI-generated images are automatically saved for future use.',
    icon: '🖼️',
  },
  {
    title: 'Campaign Management',
    desc: 'Plan, schedule, and track your campaigns. Analyze performance and optimize your strategy with built-in analytics.',
    icon: '📊',
  },
];

const testimonials = [
  {
    name: 'Alex Johnson',
    text: 'SocialsAI made it so easy to create and schedule posts for all my platforms. The AI content suggestions are a game changer!',
  },
  {
    name: 'Priya Singh',
    text: 'I love how I can generate images and manage my campaigns in one place. Highly recommended for busy marketers!',
  },
];

const howSteps = [
  {
    step: 1,
    title: 'Register or Login',
    desc: 'Create your account or log in to get started.',
  },
  {
    step: 2,
    title: 'Connect Platforms',
    desc: 'Link your social media accounts for seamless publishing.',
  },
  {
    step: 3,
    title: 'Create or Generate Content',
    desc: 'Write your own or use AI to generate posts and images.',
  },
  {
    step: 4,
    title: 'Schedule or Publish',
    desc: 'Plan ahead or publish instantly to your audience.',
  },
  {
    step: 5,
    title: 'Track & Manage',
    desc: 'Monitor engagement and manage your campaigns.',
  },
];

const Main: React.FC = () => {
  const navigate = useNavigate ? useNavigate() : (url: string) => { window.location.href = url; };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white scroll-smooth">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-gray-800 shadow">
        <div className="text-2xl font-bold tracking-wide">SocialsAI</div>
        <nav className="flex items-center gap-6">
          <a href="#about" className="hover:text-yellow-400">About</a>
          <a href="#features" className="hover:text-yellow-400">Features</a>
          <a href="#how" className="hover:text-yellow-400">How it works</a>
          <a href="#contact" className="hover:text-yellow-400">Contact</a>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-4 py-2 rounded mx-2"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded"
            onClick={() => navigate('/register')}
          >
            Community Registration
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-gray-900 to-yellow-900 opacity-70 z-0" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Create, Schedule, and Share Social Content with <span className="text-yellow-400">AI</span>
          </h1>
          <p className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto">
            Effortlessly generate posts and images, manage campaigns, and publish to LinkedIn, Instagram, Twitter, and more—all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-3 rounded"
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
            <a href="#features" className="bg-gray-800 border border-yellow-500 text-yellow-400 px-6 py-3 rounded hover:bg-yellow-500 hover:text-gray-900">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Platform Integrations */}
      <section className="py-12 bg-gray-800 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">Integrates with your favorite platforms</h2>
          <div className="flex flex-wrap justify-center gap-12">
            {platforms.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center group"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-lg transition-transform group-hover:scale-110"
                  style={{
                    background: p.name === 'LinkedIn'
                      ? '#0077B5'
                      : p.name === 'Instagram'
                      ? 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)'
                      : p.name === 'Twitter'
                      ? '#1DA1F2'
                      : p.name === 'Facebook'
                      ? '#1877F3'
                      : '#333',
                  }}
                >
                  <img
                    src={p.icon}
                    alt={p.alt}
                    className="w-8 h-8"
                    style={{ filter: 'invert(1)' }}
                  />
                </div>
                <span className="text-lg font-semibold text-white group-hover:text-yellow-400">{p.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-900 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">About SocialsAI</h2>
          <p className="text-lg">
            SocialsAI is your all-in-one platform for social media content creation, powered by advanced AI. Seamlessly connect your favorite platforms, generate creative posts and images, and manage your campaigns with ease.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-gray-800 border-t border-gray-700">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 bg-gray-900 rounded-2xl p-8 shadow-lg transition-transform hover:scale-105 hover:bg-gray-700 hover:shadow-2xl cursor-pointer group border border-transparent hover:border-yellow-400"
            >
              <span
                className="text-4xl mr-2 transition-transform group-hover:scale-125"
                aria-label={f.title + ' icon'}
              >
                {f.icon}
              </span>
              <div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">{f.title}</h3>
                <p className="text-base text-gray-200 group-hover:text-yellow-100 transition-colors">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-16 bg-gray-900 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
            {howSteps.map((step) => (
              <div
                key={step.step}
                className="flex flex-col items-center bg-gray-800 rounded-2xl p-8 shadow-lg h-full transition-transform hover:scale-105 hover:bg-gray-700 hover:shadow-2xl cursor-pointer group border border-transparent hover:border-yellow-400"
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-yellow-400 text-gray-900 font-bold text-2xl mb-4 shadow group-hover:bg-yellow-500 group-hover:text-gray-800 transition-colors">
                  {step.step}
                </div>
                <h4 className="text-lg font-bold mb-2 text-yellow-400 text-center group-hover:text-yellow-200 transition-colors">{step.title}</h4>
                <p className="text-center text-base text-gray-200 group-hover:text-yellow-100 transition-colors">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 px-4 bg-gray-800 border-t border-gray-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">What Our Users Say</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-gray-900 rounded-lg p-6 shadow-md flex-1">
                <p className="italic mb-4">"{t.text}"</p>
                <span className="font-semibold text-yellow-400">- {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
          <p className="mb-4">Register to connect with other creators, share feedback, and get the most out of SocialsAI.</p>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded"
            onClick={() => navigate('/register')}
          >
            Community Registration
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 px-4 bg-gray-800 border-t border-gray-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">Contact</h2>
          <p className="mb-8 text-lg">
            For questions, feedback, or partnership inquiries, reach out to our community leaders or email us directly.
          </p>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
            {/* Aadhityaa SB */}
            <div className="flex flex-col items-center gap-2 bg-white/10 rounded-xl px-8 py-6 w-full max-w-xs">
              <div className="flex items-center gap-2">
                <FaUser className="text-yellow-400 text-2xl" />
                <span className="font-semibold text-lg text-yellow-400">Aadhityaa SB <span className="text-gray-300">(Aadhi)</span></span>
              </div>
              <div className="flex items-center gap-2">
                <FaAward className="text-purple-400 text-lg" />
                <span className="text-purple-300 font-medium">AWS Community Builder</span>
              </div>
              <a
                href="https://www.linkedin.com/in/aadhi0612/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:underline"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v5.62z"/></svg>
                LinkedIn
              </a>
            </div>
            {/* Ayyanar Jeyakrishnan (AJ) */}
            <div className="flex flex-col items-center gap-2 bg-white/10 rounded-xl px-8 py-6 w-full max-w-xs">
              <div className="flex items-center gap-2">
                <FaUser className="text-blue-400 text-2xl" />
                <span className="font-semibold text-lg text-blue-400">Ayyanar Jeyakrishnan <span className="text-gray-300">(AJ)</span></span>
              </div>
              <div className="flex items-center gap-2">
                <FaAward className="text-green-400 text-lg" />
                <span className="text-green-300 font-medium">AWS Hero</span>
              </div>
              <a
                href="https://www.linkedin.com/in/jayyanar/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:underline"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v5.62z"/></svg>
                LinkedIn
              </a>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-blue-400 text-xl" />
              <a href="mailto:info@dataopslabs.com" className="text-blue-400 hover:underline text-lg font-semibold">
                info@dataopslabs.com
              </a>
            </div>
            <span className="text-gray-400 text-sm mt-2">Official website contact email</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-800 text-center text-gray-400 border-t border-gray-700">
        <div className="flex flex-col items-center gap-2">
          <div>&copy; {new Date().getFullYear()} SocialsAI. All rights reserved.</div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              Powered by 
              <span className="text-orange-400 font-semibold">Amazon Nova</span>
              and
              <span className="text-blue-400 font-semibold">DataOps Labs</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Main;
