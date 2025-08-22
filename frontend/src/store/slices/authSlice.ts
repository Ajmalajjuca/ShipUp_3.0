import { createSlice,  } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';



const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; }>) => {
      state.isLoading = false;
      state.user = {
    ...state.user,       
    ...action.payload.user 
  };
      
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = null;
    },
    
    restoreSessionStart(state) {
      state.isLoading = true;
    },
    restoreSessionEnd(state) {
      state.isLoading = false;
    },
    
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout,
  restoreSessionStart, 
  restoreSessionEnd,
} = authSlice.actions;

export default authSlice.reducer;