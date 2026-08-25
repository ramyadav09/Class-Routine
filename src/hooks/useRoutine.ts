import {useState, useCallback, useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getStudentRoutine} from '../services/routineService';
import {ClassInfo} from '../types';
import {STORAGE_KEYS} from '../utils/constants';

interface StudentInfo {
  section: string;
  ipa: string;
  svp: string;
}

interface RoutineState {
  loading: boolean;
  error: string | null;
  rollNumber: string;
  studentInfo: StudentInfo | null;
  mergedRoutine: Record<string, Record<string, ClassInfo | null>> | null;
}

const initialState: RoutineState = {
  loading: false,
  error: null,
  rollNumber: '',
  studentInfo: null,
  mergedRoutine: null,
};

export const useRoutine = () => {
  const [state, setState] = useState<RoutineState>(initialState);
  const [savedRollNumber, setSavedRollNumber] = useState<string>('');
  const requestId = useRef(0);
  const rollRef = useRef(state.rollNumber);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.ROLL_NUMBER);
        if (saved) {
          rollRef.current = saved;
          setSavedRollNumber(saved);
          setState(prev => ({...prev, rollNumber: saved}));
        }
      } catch {
        // Silently fail on storage read
      }
    })();
  }, []);

  const setRollNumber = useCallback((roll: string) => {
    rollRef.current = roll;
    setState(prev => ({...prev, rollNumber: roll}));
  }, []);

  const loadRoutine = useCallback(async (rollNumber?: string) => {
    const roll = (rollNumber ?? rollRef.current).trim();
    if (!roll) {
      setState(prev => ({...prev, error: 'Please enter a roll number'}));
      return;
    }

    const myRequest = ++requestId.current;
    setState(prev => ({...prev, loading: true, error: null}));

    try {
      const result = await getStudentRoutine(roll);

      if (myRequest !== requestId.current) {
        return;
      }

      if (!result) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Student not found. Please check your roll number.',
          studentInfo: null,
          mergedRoutine: null,
        }));
        return;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.ROLL_NUMBER, roll);
      setSavedRollNumber(roll);

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        rollNumber: roll,
        studentInfo: result.student,
        mergedRoutine: result.mergedRoutine,
      }));
    } catch (err) {
      if (myRequest !== requestId.current) {
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Failed to load routine. Please try again.';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
        studentInfo: null,
        mergedRoutine: null,
      }));
    }
  }, [state.rollNumber]);

  const cancelLoad = useCallback(() => {
    requestId.current++;
  }, []);

  const reset = useCallback(() => {
    requestId.current++;
    rollRef.current = '';
    setState(initialState);
    setSavedRollNumber('');
  }, []);

  const deleteSavedRoll = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ROLL_NUMBER);
      setSavedRollNumber('');
      reset();
    } catch {
      // Silently fail
    }
  }, [reset]);

  return {
    ...state,
    savedRollNumber,
    setRollNumber,
    loadRoutine,
    reset,
    cancelLoad,
    deleteSavedRoll,
  };
};
