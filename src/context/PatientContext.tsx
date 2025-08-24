"use client";

import React, { createContext, useReducer, useContext, useEffect, type ReactNode, type Dispatch, useMemo } from 'react';
import { type Patient, type Evaluation, type TreatingPhysician } from '@/lib/types';

interface PatientState {
  patients: Patient[];
  doctors: TreatingPhysician[];
  isInitialized: boolean;
}

type Action =
  | { type: 'INITIALIZE'; payload: Patient[] }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'REMOVE_PATIENT'; payload: string } // payload is patientId
  | { type: 'ADD_EVALUATION'; payload: { patientId: string; evaluation: Evaluation } }
  | { type: 'UPDATE_EVALUATION'; payload: { patientId: string; evaluation: Evaluation } }
  | { type: 'REMOVE_EVALUATION'; payload: { patientId: string; evaluationId: string } };

const initialState: PatientState = {
  patients: [],
  doctors: [],
  isInitialized: false,
};

function patientReducer(state: PatientState, action: Action): PatientState {
  let newState: PatientState;
  switch (action.type) {
    case 'INITIALIZE':
      newState = { ...state, patients: action.payload, isInitialized: true };
      break;
    case 'ADD_PATIENT':
      newState = { ...state, patients: [...state.patients, action.payload] };
      break;
    case 'UPDATE_PATIENT':
      newState = {
        ...state,
        patients: state.patients.map(p => p.id === action.payload.id ? action.payload : p),
      };
      break;
    case 'REMOVE_PATIENT':
      newState = {
        ...state,
        patients: state.patients.filter(p => p.id !== action.payload),
      };
      break;
    case 'ADD_EVALUATION': {
      const { patientId, evaluation } = action.payload;
      newState = {
        ...state,
        patients: state.patients.map(p =>
          p.id === patientId
            ? { ...p, evaluations: [...p.evaluations, evaluation] }
            : p
        ),
      };
      break;
    }
    case 'UPDATE_EVALUATION': {
      const { patientId, evaluation } = action.payload;
      newState = {
        ...state,
        patients: state.patients.map(p =>
          p.id === patientId
            ? { ...p, evaluations: p.evaluations.map(e => e.id === evaluation.id ? evaluation : e) }
            : p
        ),
      };
      break;
    }
    case 'REMOVE_EVALUATION': {
      const { patientId, evaluationId } = action.payload;
      newState = {
        ...state,
        patients: state.patients.map(p =>
          p.id === patientId
            ? { ...p, evaluations: p.evaluations.filter(e => e.id !== evaluationId) }
            : p
        ),
      };
      break;
    }
    default:
      newState = state;
  }
  
  // Recalculate doctors list
  const allPhysicians = newState.patients.flatMap(p => p.treatingPhysicians);
  const uniquePhysiciansMap = new Map<string, TreatingPhysician>();
  allPhysicians.forEach(p => {
    if (!uniquePhysiciansMap.has(p.name)) {
      uniquePhysiciansMap.set(p.name, p);
    }
  });
  newState.doctors = Array.from(uniquePhysiciansMap.values()).sort((a,b) => a.name.localeCompare(b.name));

  return newState;
}

const PatientContext = createContext<{ state: PatientState; dispatch: Dispatch<Action> } | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(patientReducer, initialState);

  useEffect(() => {
    try {
      const storedPatients = localStorage.getItem('patients');
      if (storedPatients) {
        dispatch({ type: 'INITIALIZE', payload: JSON.parse(storedPatients) });
      } else {
        dispatch({ type: 'INITIALIZE', payload: [] });
      }
    } catch (error) {
      console.error("Failed to load patients from localStorage", error);
      dispatch({ type: 'INITIALIZE', payload: [] });
    }
  }, []);
  
  useEffect(() => {
    if (state.isInitialized) {
      try {
        localStorage.setItem('patients', JSON.stringify(state.patients));
      } catch (error) {
        console.error("Failed to save patients to localStorage", error);
      }
    }
  }, [state.patients, state.isInitialized]);

  return (
    <PatientContext.Provider value={{ state, dispatch }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatientContext() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatientContext must be used within a PatientProvider');
  }
  return context;
}
