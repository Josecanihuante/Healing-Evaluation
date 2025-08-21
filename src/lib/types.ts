export interface Evaluation {
  id: string;
  type: 'treatment' | 'surgical';
  procedureName: string;
  writtenEvaluation: string;
  scaleRating: number; // 0.0 to 1.0
  continuousValue: number;
  dateEvaluated: string; // ISO string
}

export interface Patient {
  id: string;
  name: string;
  diagnosis: string;
  comorbidities: string[];
  medications: string[];
  treatments: string[];
  surgicalProcedures: string[];
  supplies: string[];
  bedType: string;
  bedNumber: string;
  evaluations: Evaluation[];
}
