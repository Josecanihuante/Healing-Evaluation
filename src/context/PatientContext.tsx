"use client";

import React, { createContext, useReducer, useContext, useEffect, type ReactNode, type Dispatch } from 'react';
import { type Patient, type Evaluation } from '@/lib/types';

interface PatientState {
  patients: Patient[];
  isInitialized: boolean;
}

type Action =
  | { type: 'INITIALIZE'; payload: Patient[] }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'ADD_EVALUATION'; payload: { patientId: string; evaluation: Evaluation } }
  | { type: 'UPDATE_EVALUATION'; payload: { patientId: string; evaluation: Evaluation } }
  | { type: 'REMOVE_EVALUATION'; payload: { patientId: string; evaluationId: string } };

const initialState: PatientState = {
  patients: [],
  isInitialized: false,
};

function patientReducer(state: PatientState, action: Action): PatientState {
  switch (action.type) {
    case 'INITIALIZE':
      return { patients: action.payload, isInitialized: true };
    case 'ADD_PATIENT':
      return { ...state, patients: [...state.patients, action.payload] };
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'ADD_EVALUATION': {
      const { patientId, evaluation } = action.payload;
      return {
        ...state,
        patients: state.patients.map(p =>
          p.id === patientId
            ? { ...p, evaluations: [...p.evaluations, evaluation] }
            : p
        ),
      };
    }
    case 'UPDATE_EVALUATION': {
      const { patientId, evaluation } = action.payload;
      return {
        ...state,
        patients: state.patients.map(p =>
          p.id === patientId
            ? { ...p, evaluations: p.evaluations.map(e => e.id === evaluation.id ? evaluation : e) }
            : p
        ),
      };
    }
    case 'REMOVE_EVALUATION': {
      const { patientId, evaluationId } = action.payload;
      return {
        ...state,
        patients: state.patients.map(p =>
          p.id === patientId
            ? { ...p, evaluations: p.evaluations.filter(e => e.id !== evaluationId) }
            : p
        ),
      };
    }
    default:
      return state;
  }
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
