import { configureStore } from '@reduxjs/toolkit';
import index from './reducers/index';

const store = configureStore({
  reducer: index,
 middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,  // speeds up large state checks
      serializableCheck: false // skips checking for non-serializable values
    }),
});

export default store;
