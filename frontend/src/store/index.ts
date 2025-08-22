import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // uses localStorage by default
import authReducer from './slices/authSlice';

import { combineReducers } from 'redux';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'] // only persist user slice
};

const rootReducer = combineReducers({
  user: authReducer,
  // other reducers...
});

const persistedReducer = persistReducer(persistConfig, rootReducer);



export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);

