
'use client'

import { usePathname } from 'next/navigation';
import ClientDashboardNav from './client-dashboard-nav';

export default function DashboardNav() {
  const pathname = usePathname();

  return <ClientDashboardNav pathname={pathname} />;
}
