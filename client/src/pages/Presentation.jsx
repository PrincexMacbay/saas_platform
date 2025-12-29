import React, { useState, useEffect } from 'react';

const Presentation = () => {
  // Add CSS animations for blob effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blob {
        0%, 100% {
          transform: translate(0, 0) scale(1);
        }
        33% {
          transform: translate(30px, -50px) scale(1.1);
        }
        66% {
          transform: translate(-20px, 20px) scale(0.9);
        }
      }
      .animate-blob {
        animation: blob 7s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      .animation-delay-4000 {
        animation-delay: 4s;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 18;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        previousSlide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const Slide = ({ children, isActive, slideNumber }) => (
    <div
      className={`absolute inset-0 w-full h-full bg-white overflow-y-auto transition-all duration-500 ${
        isActive
          ? 'opacity-100 translate-x-0 z-10'
          : 'opacity-0 translate-x-8 pointer-events-none'
      }`}
    >
      <div className="relative w-full h-full p-12 md:p-16">
        <div className="absolute top-5 right-8 bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold z-20 shadow-lg">
          {slideNumber} / {totalSlides}
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Beautiful Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      </div>

      {/* Presentation Container */}
      <div className="relative z-10 w-full h-full">
        {/* Slide 1: Title */}
        <Slide isActive={currentSlide === 0} slideNumber={1}>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Social Network
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 mb-4">
              Social Network & Membership Management System
            </p>
            <p className="text-lg md:text-xl text-gray-500 mb-12">
              A Comprehensive Multi-Tenant Platform for Organizations
            </p>
            <div className="mt-12 space-y-3 text-gray-700">
              <div className="text-xl font-semibold">Prince Oghenewoma Macbay</div>
              <div className="text-lg">Graduation Project 2 (SWE492)</div>
              <div className="text-lg">31st December, 2025</div>
            </div>
          </div>
        </Slide>

        {/* Slide 2: Agenda */}
        <Slide isActive={currentSlide === 1} slideNumber={2}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Presentation Outline
          </h1>
          <ol className="text-xl md:text-2xl space-y-4 ml-8 list-decimal text-gray-700">
            <li>Introduction & Problem Statement</li>
            <li>Project Objectives</li>
            <li>System Architecture & Technology Stack</li>
            <li>Core Features & Functionalities</li>
            <li>Database Design</li>
            <li>Key Implementations</li>
            <li>Security & Best Practices</li>
            <li>Challenges & Solutions</li>
            <li>Results & Achievements</li>
            <li>Future Enhancements</li>
            <li>Q&A</li>
          </ol>
        </Slide>

        {/* Slide 3: Problem Statement */}
        <Slide isActive={currentSlide === 2} slideNumber={3}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Problem Statement
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-6 mb-4">Current Challenges:</h2>
          <ul className="text-lg space-y-3 ml-6 text-gray-600 mb-8">
            <li>• Organizations struggle with <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-1 rounded font-semibold">fragmented systems</span></li>
            <li>• Manual membership management processes</li>
            <li>• Lack of integrated social networking</li>
            <li>• Inefficient job posting and application tracking</li>
            <li>• No unified platform for member engagement</li>
          </ul>
          <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Solution:</h2>
          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
            <p className="font-semibold text-lg mb-4">A multi-tenant SaaS platform that combines:</p>
            <ul className="space-y-2 ml-6 text-gray-700">
              <li>• Membership Management</li>
              <li>• Social Networking</li>
              <li>• Career Center</li>
              <li>• Payment Processing</li>
              <li>• Administrative Analytics</li>
            </ul>
          </div>
        </Slide>

        {/* Slide 4: Project Objectives */}
        <Slide isActive={currentSlide === 3} slideNumber={4}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Project Objectives
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1. Multi-Tenant Membership Management</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Support multiple organizations</li>
                <li>• Customizable plans & forms</li>
                <li>• Automated workflows</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2. Social Networking Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Community spaces</li>
                <li>• Posts, comments, likes</li>
                <li>• Real-time notifications</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-purple-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3. Career Center</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Job board with search</li>
                <li>• Application tracking</li>
                <li>• Resume management</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-pink-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4. Payment & Subscriptions</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Multiple payment methods</li>
                <li>• Automated scheduling</li>
                <li>• Debt tracking</li>
              </ul>
            </div>
          </div>
        </Slide>

        {/* Slide 5: System Architecture */}
        <Slide isActive={currentSlide === 4} slideNumber={5}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            System Architecture
          </h1>
          <div className="space-y-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-blue-700 mb-2">PRESENTATION LAYER (Frontend)</h3>
              <p className="text-gray-700">React.js 19 • React Router • Context API • Axios</p>
            </div>
            <div className="text-center text-4xl text-indigo-500 font-bold">↕ HTTP/REST</div>
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <h3 className="text-2xl font-bold text-purple-700 mb-2">APPLICATION LAYER (Backend)</h3>
              <p className="text-gray-700">Node.js • Express.js • RESTful API • JWT • Socket.io</p>
            </div>
            <div className="text-center text-4xl text-indigo-500 font-bold">↕ Sequelize ORM</div>
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-2xl font-bold text-green-700 mb-2">DATA LAYER (Database)</h3>
              <p className="text-gray-700">PostgreSQL • 27+ Normalized Tables • Foreign Keys</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <strong className="text-gray-800">Design Patterns:</strong> MVC • Repository Pattern • Middleware Pattern • Service Layer
          </div>
        </Slide>

        {/* Slide 6: Technology Stack */}
        <Slide isActive={currentSlide === 5} slideNumber={6}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Technology Stack
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-6 mb-4">Frontend Technologies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {['React.js 19', 'React Router 7.7.1', 'Axios 1.11.0', 'Vite 7.0.6', 'Tailwind CSS', 'Socket.io Client'].map((tech) => (
              <div key={tech} className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500 font-semibold text-gray-800">
                {tech}
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Backend Technologies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['Node.js 20+', 'Express.js 4.21.2', 'PostgreSQL 12+', 'Sequelize 6.37.7', 'JWT 9.0.2', 'Socket.io'].map((tech) => (
              <div key={tech} className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500 font-semibold text-gray-800">
                {tech}
              </div>
            ))}
          </div>
        </Slide>

        {/* Slide 7: Core Features - Membership */}
        <Slide isActive={currentSlide === 6} slideNumber={7}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Core Features: Membership Management
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {[
              { title: '📋 Membership Plans', items: ['Custom pricing tiers', 'Renewal intervals', 'Free & paid plans'] },
              { title: '📝 Application Forms', items: ['Dynamic form builder', 'Multiple field types', 'Publish/unpublish'] },
              { title: '🔄 Application Workflow', items: ['Public submission', 'Admin review', 'Automated approval'] },
              { title: '💳 Digital Cards', items: ['Template-based', 'Customizable design', 'Auto-assignment'] },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <ul className="space-y-2 text-gray-700">
                  {feature.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Slide>

        {/* Slide 8: Core Features - Social */}
        <Slide isActive={currentSlide === 7} slideNumber={8}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Core Features: Social Networking
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {[
              { title: '👤 User Profiles', items: ['Individual & company', 'Follow/unfollow', 'Activity feeds'] },
              { title: '🌐 Spaces (Communities)', items: ['Public/private spaces', 'Join policies', 'Member management'] },
              { title: '📱 Content Sharing', items: ['Create & edit posts', 'Comments & likes', 'Media attachments'] },
              { title: '💬 Real-Time Communication', items: ['1-on-1 messaging', 'Group chat', 'File sharing', 'Read receipts'] },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <ul className="space-y-2 text-gray-700">
                  {feature.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Slide>

        {/* Slide 9: Core Features - Career */}
        <Slide isActive={currentSlide === 8} slideNumber={9}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Core Features: Career Center
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {[
              { title: '💼 Job Board', items: ['Post opportunities', 'Advanced search', 'Category filtering'] },
              { title: '📄 Application System', items: ['Resume upload', 'Cover letters', 'Status tracking'] },
              { title: '📊 Employer Dashboard', items: ['View applications', 'Download resumes', 'Status updates'] },
              { title: '🔔 Notifications', items: ['New application alerts', 'Status updates', 'Real-time delivery'] },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <ul className="space-y-2 text-gray-700">
                  {feature.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Slide>

        {/* Slide 10: Database Design */}
        <Slide isActive={currentSlide === 9} slideNumber={10}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Database Design
          </h1>
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 rounded-lg text-center shadow-lg">
              <div className="text-5xl font-bold mb-2">27+</div>
              <div className="text-lg opacity-90">Normalized Tables</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-8 rounded-lg text-center shadow-lg">
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Foreign Key Relationships</div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Key Tables:</h2>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {['Users & Profiles', 'Plans & Applications', 'Subscriptions', 'Jobs & Applications', 'Posts & Comments', 'Spaces & Memberships', 'Payments & Invoices', 'Notifications', 'Chat & Messages'].map((table) => (
              <div key={table} className="bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-500 font-semibold text-gray-800 text-sm">
                {table}
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <strong className="text-gray-800">Design Principles:</strong> Normalization (3NF) • Referential Integrity • Cascade Deletes • Unique Constraints
          </div>
        </Slide>

        {/* Slide 11: Real-Time Features */}
        <Slide isActive={currentSlide === 10} slideNumber={11}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Key Implementations: Real-Time Features
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {[
              { title: '🔌 Socket.io Integration', items: ['WebSocket communication', 'User room management', 'Connection handling'] },
              { title: '🔔 Notification System', items: ['Real-time delivery', 'Multiple types', 'Persistence'] },
              { title: '💬 Chat System', items: ['1-on-1 messaging', 'Group chat', 'File sharing', 'Read receipts'] },
              { title: '⚡ Live Updates', items: ['Activity feeds', 'Post interactions', 'Status changes'] },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg border-l-4 border-indigo-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <ul className="space-y-2 text-gray-700">
                  {feature.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Slide>

        {/* Slide 12: Security */}
        <Slide isActive={currentSlide === 11} slideNumber={12}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Security & Authentication
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {[
              { title: '🔐 Authentication', items: ['JWT-based tokens', 'Token expiration', 'Bcrypt password hashing', 'Session management'] },
              { title: '🛡️ Authorization', items: ['Role-based access', 'Protected routes', 'Middleware validation', 'Resource ownership'] },
              { title: '🔒 Data Protection', items: ['SQL injection prevention', 'Input validation', 'XSS protection', 'CORS configuration'] },
              { title: '📁 File Security', items: ['Type validation', 'Size limits', 'Cloud storage', 'Image processing'] },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg border-l-4 border-red-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <ul className="space-y-2 text-gray-700">
                  {feature.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Slide>

        {/* Slide 13: Project Statistics */}
        <Slide isActive={currentSlide === 12} slideNumber={13}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Project Statistics & Achievements
          </h1>
          <div className="grid grid-cols-2 gap-6 mt-6">
            {[
              { number: '10,000+', label: 'Lines of Code' },
              { number: '75+', label: 'React Components' },
              { number: '50+', label: 'API Endpoints' },
              { number: '27+', label: 'Database Tables' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 rounded-lg text-center shadow-lg">
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Feature Completion:</h2>
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              'Membership Management (100%)',
              'Social Networking (100%)',
              'Career Center (100%)',
              'Payment Processing (100%)',
              'Real-Time Features (100%)',
              'Admin Dashboards (100%)',
            ].map((feature) => (
              <span key={feature} className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                ✅ {feature}
              </span>
            ))}
          </div>
        </Slide>

        {/* Slide 14: Challenges & Solutions */}
        <Slide isActive={currentSlide === 13} slideNumber={14}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Challenges & Solutions
          </h1>
          <div className="space-y-4 mt-6">
            {[
              { challenge: 'Challenge 1: Multi-Tenant Data Isolation', solution: 'Organization-based filtering in all queries, middleware validation' },
              { challenge: 'Challenge 2: Real-Time Notification Delivery', solution: 'Database persistence + Socket.io for real-time delivery' },
              { challenge: 'Challenge 3: File Upload & Storage', solution: 'Cloudinary integration for persistent cloud storage' },
              { challenge: 'Challenge 4: Complex State Management', solution: 'React Context API for global state, local state for components' },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg border-l-4 border-yellow-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.challenge}</h3>
                <p className="text-gray-700"><strong>Solution:</strong> {item.solution}</p>
              </div>
            ))}
          </div>
        </Slide>

        {/* Slide 15: Results */}
        <Slide isActive={currentSlide === 14} slideNumber={15}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Results & Impact
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-6 mb-4">Technical Achievements:</h2>
          <ul className="text-lg space-y-3 ml-6 text-gray-700 mb-8">
            <li>✅ Production-ready multi-tenant SaaS platform</li>
            <li>✅ Scalable architecture supporting multiple organizations</li>
            <li>✅ Real-time communication system</li>
            <li>✅ Comprehensive feature set</li>
            <li>✅ Secure and optimized implementation</li>
          </ul>
          <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Business Value:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">For Organizations:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Automated workflows</li>
                <li>• Centralized data</li>
                <li>• Integrated networking</li>
                <li>• Comprehensive analytics</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">For Members:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Single platform</li>
                <li>• Easy applications</li>
                <li>• Community engagement</li>
                <li>• Job opportunities</li>
              </ul>
            </div>
          </div>
        </Slide>

        {/* Slide 16: Future Enhancements */}
        <Slide isActive={currentSlide === 15} slideNumber={16}>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-indigo-500">
            Future Enhancements
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {[
              { title: '🔐 Enhanced Security', items: ['Two-Factor Authentication', 'OAuth/SSO', 'Advanced sessions'] },
              { title: '📊 Advanced Analytics', items: ['Custom reports', 'Data export', 'Predictive analytics'] },
              { title: '📱 Mobile Applications', items: ['React Native app', 'Push notifications', 'Offline support'] },
              { title: '⚡ Performance', items: ['Caching strategies', 'CDN implementation', 'Load balancing'] },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <ul className="space-y-2 text-gray-700">
                  {feature.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Slide>

        {/* Slide 17: Conclusion */}
        <Slide isActive={currentSlide === 16} slideNumber={17}>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl font-bold text-indigo-600 mb-8">Thank You!</div>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">Project Summary</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl">
              Successfully developed a comprehensive multi-tenant SaaS platform integrating<br />
              membership management, social networking, and career services
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-semibold">
                27+ Database Tables
              </span>
              <span className="bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-lg font-semibold">
                50+ API Endpoints
              </span>
              <span className="bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-semibold">
                75+ React Components
              </span>
            </div>
          </div>
        </Slide>

        {/* Slide 18: Q&A */}
        <Slide isActive={currentSlide === 17} slideNumber={18}>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-12">
              Questions & Answers
            </h1>
            <div className="text-xl md:text-2xl text-gray-700 space-y-4">
              <p className="font-semibold mb-6">Contact Information:</p>
              <p>Email: [Your Email]</p>
              <p>Live Demo: [Frontend URL]</p>
            </div>
          </div>
        </Slide>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={previousSlide}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg transition-all hover:scale-110"
        title="Previous Slide"
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg transition-all hover:scale-110"
        title="Next Slide"
      >
        ›
      </button>

      {/* Bottom Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-4">
        <button
          onClick={previousSlide}
          className="bg-white hover:bg-indigo-500 text-indigo-600 hover:text-white border-2 border-indigo-500 px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:scale-105"
        >
          ← Previous
        </button>
        <button
          onClick={nextSlide}
          className="bg-white hover:bg-indigo-500 text-indigo-600 hover:text-white border-2 border-indigo-500 px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:scale-105"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Presentation;
