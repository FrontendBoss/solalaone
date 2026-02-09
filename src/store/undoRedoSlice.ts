import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnalysisState } from './types';

interface UndoRedoState {
  past: AnalysisState[];
  present: AnalysisState;
  future: AnalysisState[];
  maxHistorySize: number;
}

const createUndoRedoSlice = (initialState: AnalysisState, maxHistorySize: number = 50) => {
  const undoRedoSlice = createSlice({
    name: 'undoRedo',
    initialState: {
      past: [],
      present: initialState,
      future: [],
      maxHistorySize
    } as UndoRedoState,
    reducers: {
      // Execute an action and save the previous state to history
      executeAction: (state, action: PayloadAction<{ type: string; payload: any }>) => {
        // Save current state to past
        state.past.push(state.present);
        
        // Limit history size
        if (state.past.length > state.maxHistorySize) {
          state.past.shift();
        }
        
        // Clear future (since we're making a new change)
        state.future = [];
        
        // The actual state update will be handled by the analysis reducer
      },
      
      // Undo the last action
      undo: (state) => {
        if (state.past.length > 0) {
          const previous = state.past.pop()!;
          state.future.unshift(state.present);
          state.present = previous;
          
          // Limit future size
          if (state.future.length > state.maxHistorySize) {
            state.future.pop();
          }
        }
      },
      
      // Redo the next action
      redo: (state) => {
        if (state.future.length > 0) {
          const next = state.future.shift()!;
          state.past.push(state.present);
          state.present = next;
          
          // Limit past size
          if (state.past.length > state.maxHistorySize) {
            state.past.shift();
          }
        }
      },
      
      // Update the present state (used by analysis reducer)
      updatePresent: (state, action: PayloadAction<AnalysisState>) => {
        state.present = action.payload;
      },
      
      // Clear all history
      clearHistory: (state) => {
        state.past = [];
        state.future = [];
      },
      
      // Jump to a specific state in history
      jumpToState: (state, action: PayloadAction<number>) => {
        const index = action.payload;
        if (index >= 0 && index < state.past.length) {
          // Move current and future states
          const newFuture = [state.present, ...state.future];
          const newPast = state.past.slice(0, index);
          const newPresent = state.past[index];
          
          // Update remaining past states to future
          const remainingPast = state.past.slice(index + 1);
          
          state.past = newPast;
          state.present = newPresent;
          state.future = [...remainingPast, ...newFuture];
        }
      }
    }
  });
  
  return undoRedoSlice;
};

export default createUndoRedoSlice;