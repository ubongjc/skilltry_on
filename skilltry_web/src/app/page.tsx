import Link from 'next/link';
import { ArrowRight, Briefcase, Target, TrendingUp, Shield, Award, Users } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
              Master Workplace Skills
              <span className="block text-blue-600 mt-2">with Realistic Simulations</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 mb-10">
              Practice real job scenarios, get instant AI-powered feedback, and advance your career with personalized training recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full sm:w-auto max-w-md sm:max-w-none">
              {userId ? (
                <Link
                  href="/dashboard"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition shadow-lg min-h-[48px] flex items-center justify-center"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/sign-in"
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-50 transition min-h-[48px] flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-100 rounded-full blur-3xl opacity-30" />
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why SkillTry-On?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to practice, improve, and succeed in your career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Briefcase className="w-8 h-8" />}
              title="Realistic Simulations"
              description="Practice real workplace scenarios in a safe environment with 5-15 minute interactive simulations"
              color="blue"
            />
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="AI-Powered Feedback"
              description="Get detailed, personalized feedback on your performance with specific areas for improvement"
              color="purple"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Track Your Progress"
              description="Monitor your improvement over time with comprehensive analytics and performance metrics"
              color="green"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Privacy-First"
              description="Your data is encrypted client-side. We never see your sensitive information"
              color="orange"
            />
            <FeatureCard
              icon={<Award className="w-8 h-8" />}
              title="Training Recommendations"
              description="Receive personalized training links based on your performance to fill skill gaps"
              color="pink"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Institutional Licensing"
              description="Perfect for schools and training programs with bulk licensing and analytics"
              color="indigo"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Step
              number={1}
              title="Choose a Simulation"
              description="Browse our library of realistic job scenarios across various industries and difficulty levels"
            />
            <Step
              number={2}
              title="Complete the Scenario"
              description="Work through the simulation, making decisions and demonstrating your skills in a realistic environment"
            />
            <Step
              number={3}
              title="Get Feedback & Improve"
              description="Receive instant AI-powered feedback with personalized recommendations for training and improvement"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Level Up Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of job seekers improving their skills with SkillTry-On
          </p>
          {!userId && (
            <Link
              href="/sign-up"
              className="inline-flex px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Start Free Trial
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">SkillTry-On</h3>
              <p className="text-sm">
                Realistic job simulations with AI-powered feedback for career success
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/simulations" className="hover:text-white transition">Simulations</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
                <li><Link href="/security" className="hover:text-white transition">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} SkillTry-On. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
      <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-6">
        {number}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
