import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard/patients');
  return null;
}
