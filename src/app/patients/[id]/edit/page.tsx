'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EditPatientForm from '@/components/edit-patient-form';
import { Patient } from '@/lib/types';

const PatientEditPage = () => {
  const params = useParams();
  const patientId = params.id as string; // Assuming the ID is a string
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        // Placeholder function to fetch patient data
        // Replace with your actual data fetching logic (e.g., API call)
        const fetchPatientById = async (id: string): Promise<Patient> => {
          return { id, name: 'John Doe', dateOfBirth: '1990-01-01' }; // Mock data
        };
        const data: Patient = await response.json();
        setPatient(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const handleUpdatePatient = async (updatedPatientData: Patient) => {
    // Placeholder function to update patient data
    // Replace with your actual data updating logic (e.g., API call)
    console.log('Updating patient:', updatedPatientData);
    // After successful update, you would typically redirect
    // router.push(`/patients/${patientId}`);
  };

  if (loading) {
    return <div>Cargando datos del paciente...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!patient) {
    return <div>Paciente no encontrado.</div>;
  }

  return (
    <div>
      <h1>Editar Paciente</h1>
      <EditPatientForm initialData={patient} onSubmit={handleUpdatePatient} />
    </div>
  );
};

export default PatientEditPage;
