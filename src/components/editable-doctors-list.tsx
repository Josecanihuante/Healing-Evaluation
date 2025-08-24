import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { type TreatingPhysician } from '@/lib/types';

interface EditableDoctorsListProps {
  doctors: TreatingPhysician[];
}

const EditableDoctorsList: React.FC<EditableDoctorsListProps> = ({ doctors }) => {
  if (doctors.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No hay médicos registrados en los perfiles de los pacientes.</p>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {doctors.map((doctor, index) => (
            <li key={index}>
              <Link href={`/dashboard/doctors/${encodeURIComponent(doctor.name)}/evaluations`} passHref>
                <div className="flex justify-between items-center p-4 hover:bg-muted/50 cursor-pointer">
                  <div>
                    <p className="font-semibold">{doctor.name}</p>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default EditableDoctorsList;
