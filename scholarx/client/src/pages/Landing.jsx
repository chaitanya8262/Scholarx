// Public landing page
import { Link } from 'react-router-dom';
import { BookOpen, FileUp, Users, CheckCircle, Zap, Shield, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Landing() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-brand-950">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="font-bold text-xl">ScholarX</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="btn-secondary">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link to="/login" className="btn-secondary">Sign In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-block badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 mb-4">
          ✨ Modern Research Publishing Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Publish research. <br />
          <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
            Faster, smarter, together.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          ScholarX streamlines the entire publication workflow — from submission and peer review
          to editorial decisions and publication — all in one beautiful platform.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/register" className="btn-primary text-base px-6 py-3">
            Start Publishing <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-6 py-3">
            I have an account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Built for every role</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: FileUp, title: 'For Researchers', desc: 'Submit papers, track status, and manage revisions with version control.', color: 'from-blue-500 to-cyan-500' },
            { icon: Users, title: 'For Reviewers', desc: 'Review assigned papers, provide structured feedback, and recommend decisions.', color: 'from-purple-500 to-pink-500' },
            { icon: CheckCircle, title: 'For Editors', desc: 'Assign reviewers, manage workflow, and publish accepted papers with DOI.', color: 'from-emerald-500 to-teal-500' },
          ].map((f, i) => (
            <div key={i} className="card p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'AI-Powered', desc: 'Auto summaries, plagiarism checks, and smart reviewer recommendations.' },
            { icon: Shield, title: 'Secure', desc: 'JWT authentication, role-based access, and encrypted passwords.' },
            { icon: CheckCircle, title: 'Version Control', desc: 'Track every revision with full history of uploaded papers.' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">{f.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="card p-10 bg-gradient-to-br from-brand-600 to-indigo-700 text-white border-none">
          <h2 className="text-3xl font-bold mb-3">Ready to publish your research?</h2>
          <p className="text-brand-100 mb-6">Join ScholarX today — it's free.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 rounded-lg font-semibold hover:bg-brand-50">
            Create your account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2026 ScholarX. Built with MERN stack.
      </footer>
    </div>
  );
}
