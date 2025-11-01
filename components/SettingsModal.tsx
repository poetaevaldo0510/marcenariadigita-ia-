import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { CogIcon } from './Shared';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showAlert: (message: string, title?: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, showAlert }) => {
    const { t, language, setLanguage } = useTranslation();
    const [enableNotifications, setEnableNotifications] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const savedSetting = localStorage.getItem('marcenapp_enable_notifications') === 'true';
            setEnableNotifications(savedSetting);
        }
    }, [isOpen]);

    const handleToggleNotifications = () => {
        const newValue = !enableNotifications;
        setEnableNotifications(newValue);
        localStorage.setItem('marcenapp_enable_notifications', String(newValue));
        
        if (newValue) {
            // In a real app, you would register with OneSignal/Firebase here.
            console.log("Simulating registration for push notifications...");
        } else {
            console.log("Simulating un-registration from push notifications...");
        }
        showAlert(t('notification_setting_saved'), t('settings'));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div 
                className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg w-full max-w-lg shadow-xl border border-[#e6ddcd] dark:border-[#4a4040] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e] flex items-center gap-2">
                        <CogIcon /> {t('settings')}
                    </h2>
                    <button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button>
                </header>

                <main className="p-6 space-y-6">
                    {/* Language Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-[#6a5f5f] dark:text-[#c7bca9] mb-3">{t('language')}</h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setLanguage('pt-BR')}
                                className={`flex-1 font-bold py-2 px-4 rounded-lg transition ${language === 'pt-BR' ? 'bg-[#d4ac6e] text-[#3e3535]' : 'bg-[#e6ddcd] dark:bg-[#5a4f4f] text-[#6a5f5f] dark:text-white hover:bg-[#dcd6c8]'}`}
                            >
                                Português (BR)
                            </button>
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`flex-1 font-bold py-2 px-4 rounded-lg transition ${language === 'en' ? 'bg-[#d4ac6e] text-[#3e3535]' : 'bg-[#e6ddcd] dark:bg-[#5a4f4f] text-[#6a5f5f] dark:text-white hover:bg-[#dcd6c8]'}`}
                            >
                                English (US)
                            </button>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-[#6a5f5f] dark:text-[#c7bca9] mb-3">{t('notifications')}</h3>
                        <div className="flex items-center justify-between p-4 bg-[#f0e9dc] dark:bg-[#3e3535] rounded-lg">
                            <label htmlFor="notifications-toggle" className="font-medium text-[#6a5f5f] dark:text-[#c7bca9]">{t('enable_push_for_leads')}</label>
                            <label htmlFor="notifications-toggle" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="notifications-toggle" checked={enableNotifications} onChange={handleToggleNotifications} className="sr-only peer" />
                                <div className="w-11 h-6 bg-[#e6ddcd] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#d4ac6e]/50 dark:peer-focus:ring-[#d4ac6e]/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#d4ac6e]"></div>
                            </label>
                        </div>
                    </div>
                </main>
                 <footer className="p-4 border-t border-[#e6ddcd] dark:border-[#4a4040] flex justify-end">
                    <button onClick={onClose} className="bg-[#8a7e7e] dark:bg-[#5a4f4f] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#6a5f5f] dark:hover:bg-[#4a4040] transition">
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
};
