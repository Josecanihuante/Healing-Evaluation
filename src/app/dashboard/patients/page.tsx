"use client";

import { usePatientContext } from '@/context/PatientContext';
import PatientListView from '@/components/patient-list-view';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientsPage() {
  const { state } = usePatientContext();

  if (!state.isInitialized) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    );
  }
  
  return <PatientListView patients={state.patients} />;
}
