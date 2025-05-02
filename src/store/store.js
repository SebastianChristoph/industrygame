import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import gameReducer from './gameSlice';
import { encryptTransform } from '../utils/encryptTransform';

const rootReducer = combineReducers({
  game: gameReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  transforms: [encryptTransform],
  // Keine whitelist mehr, wir persistieren den gesamten Root-State
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store); 