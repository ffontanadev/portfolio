import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import ResumeViewer, { type ResumeSource } from '@/components/ResumeViewer';
import { HTML_RESUME, MARKDOWN_RESUME } from '@/constants';
import { useTranslation } from '@/i18n';

interface AppContextType {
    isOpen: boolean;
    openResume: () => void;
    closeResume: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const resumeSources: ResumeSource[] = [
    { format: 'pdf', url: '/docs/resume.pdf' },
    { format: 'markdown', content: MARKDOWN_RESUME },
    { format: 'html', content: HTML_RESUME },
];

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const openResume = () => setIsOpen(true);
    const closeResume = () => setIsOpen(false);

    return (
        <AppContext.Provider value={{ isOpen, openResume, closeResume }}>
            {children}
            <ResumeViewer
                isOpen={isOpen}
                onClose={closeResume}
                sources={resumeSources}
                defaultFormat="pdf"
                title={t('resume.title')}
            />
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within a AppContextProvider');
    }
    return context;
};
