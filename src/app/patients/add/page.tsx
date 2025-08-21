import AddPatientForm from '@/components/add-patient-form';

export default function AddPatientPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <h1 className="text-3xl font-bold font-headline">Add New Patient</h1>
            <p className="text-muted-foreground">Fill in the details below to add a new patient record.</p>
        </div>
        <AddPatientForm />
      </div>
    </div>
  );
}
