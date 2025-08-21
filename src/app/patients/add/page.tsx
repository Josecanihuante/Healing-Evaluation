import AddPatientForm from '@/components/add-patient-form';

export default function AddPatientPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <h1 className="text-3xl font-bold font-headline">Añadir Nuevo Paciente</h1>
            <p className="text-muted-foreground">Complete los detalles a continuación para añadir un nuevo registro de paciente.</p>
        </div>
        <AddPatientForm />
      </div>
    </div>
  );
}
