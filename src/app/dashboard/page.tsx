import { redirect } from 'next/navigation';

export default function DashboardIndexPage() {
  // Redirect to the user dashboard
  redirect('/dashboard/user');
}

