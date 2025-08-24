'use client';

import EditableDoctorsList from '@/components/editable-doctors-list';
import { usePatientContext } from '@/context/PatientContext';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

const DoctorsPage: React.FC = () => {
  const { state } = usePatientContext();

  if (!state.isInitialized) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Lista de Médicos</h1>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Lista de Médicos</h1>
      <EditableDoctorsList doctors={state.doctors} />
    </div>
  );
};

export default DoctorsPage;
