import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import SimulationBuilder from '@/components/admin/SimulationBuilder';

export default async function NewSimulationPage() {
  const user = await requireAdmin().catch(() => null);

  if (!user) {
    redirect('/sign-in?redirect=/admin/simulations/new');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SimulationBuilder />
      </div>
    </div>
  );
}
