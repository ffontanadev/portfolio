import { useContext } from 'react';
import { I18nContext, type I18nContextValue } from './context';

/**
 * Access the active locale, the `t()` translator, and the typed `messages`
 * tree. Must be used within an `<I18nProvider>`.
 */
export const useTranslation = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
