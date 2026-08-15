import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from './store';

/**
 * Typed Redux Hooks
 * Use these hooks throughout your app instead of plain `useDispatch` and `useSelector`
 * This provides better TypeScript support and autocomplete
 */

// Use throughout your app instead of plain `useDispatch`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// Use throughout your app instead of plain `useSelector`
export const useAppSelector = useSelector.withTypes<RootState>();

// Use throughout your app instead of plain `useStore`
export const useAppStore = useStore.withTypes<AppStore>();
