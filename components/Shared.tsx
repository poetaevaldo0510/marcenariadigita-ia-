import React from 'react';
import type { AlertState, ImageModalState } from '../types.ts';

// --- ICONS ---

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4',
    };
    return (
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-[#d4ac6e] border-r-[#d4ac6e] border-b-[#4a4040] border-l-[#4a4040]`}></div>
    );
};

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3.5 13.5L12 22L20.5 13.5M3.5 10.5L12 2L20.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const MicIcon: React.FC<{ isRecording?: boolean; isSpeaking?: boolean }> = ({ isRecording, isSpeaking }) => {
    const colorClass = isRecording 
        ? (isSpeaking ? 'text-green-400' : 'text-white') 
        : 'text-[#d4ac6e]';

    return (
        <svg className={`w-6 h-6 transition-colors duration-200 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
    );
};

export const BookIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
);

export const WandIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/></svg>
);

export const SparklesIcon: React.FC = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 13.5a3.375 3.375 0 00-3.375-3.375L13.5 9.75l-1.125.375a3.375 3.375 0 00-2.456 2.456L9.75 13.5l.375 1.125a3.375 3.375 0 002.456 2.456L13.5 18l1.125-.375a3.375 3.375 0 002.456-2.456L18 13.5z" />
    </svg>
);

export const StarIcon: React.FC<{ isFavorite?: boolean; className?: string }> = ({ isFavorite, className }) => (
    <svg className={`w-5 h-5 ${className}`} fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);

export const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-6 h-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
);

export const ARIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-5 h-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.375a6.375 6.375 0 100-12.75 6.375 6.375 0 000 12.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 9.75A9.375 9.375 0 003 9.75" />
    </svg>
);

export const BalconyIcon: React.FC = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 11-10 0 5 5 0 0110 0z M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/></svg>;
export const BathroomIcon: React.FC = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11h14v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7zm14-4V5a2 2 0 00-2-2h-1M5 7V5a2 2 0 012-2h1"/></svg>;
export const BedroomIcon: React.FC = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M6 10h12M6 14h12M3 7a2 2 0 012-2h14a2 2 0 012 2"/></svg>;

export const BlueprintIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v18M19 3v18M3 8h18M3 16h18M8 3v18M16 3v18"/></svg>
);
export const BoltIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-5 h-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

export const CameraIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
);
export const CatalogIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
);
export const ClosetIcon: React.FC = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 4a2.5 2.5 0 015 0v2.5H9.5V4z M7 18.5V9.5h10v9m-12 .5h14"/></svg>;

export const CogIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-5 h-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-.962a8.714 8.714 0 012.59 0c.55.045 1.02.42 1.11.962l.135 2.156a6.37 6.37 0 01-.52 2.58l-1.02 1.745a6.375 6.375 0 01-1.02 1.02l-1.745 1.02a6.375 6.375 0 01-2.58.52l-2.156.135c-.542.09-1.007-.56-1.007-1.11V11.25a6.375 6.375 0 01-.52-2.58l1.02-1.745a6.375 6.375 0 011.02-1.02l1.745-1.02a6.375 6.375 0 012.58-.52l2.156-.135" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);

export const CommunityIcon: React.FC = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.513-.96 1.487-1.591 2.571-1.82m-2.571 1.82a3.375 3.375 0 00-2.571 1.82m2.571-1.82c-.58.192-.58.385 0 .578m-2.571-1.82a3.375 3.375 0 00-2.571 1.82m5.142 0a3.375 3.375 0 00-2.571-1.82m2.571 1.82a3.375 3.375 0 002.571 1.82M9.75 9.75c0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5-2.5-1.119-2.5-2.5z" />
    </svg>
);

export const CopyIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 4h8a2 2 0 002-2V6a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
);

export const CubeIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
);

export const CurrencyDollarIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4a2 2 0 012 2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2V7a2 2 0 012-2h4"/></svg>
);

export const DocumentDuplicateIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
);

export const DocumentTextIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
);

export const DollarCircleIcon: React.FC = () => (
<svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
);

export const DownloadIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
);

export const EmailIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
);

export const EllipsisVerticalIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-5 h-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
);

export const HeadsetIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 10a6 6 0 00-12 0v8h4v-3a2 2 0 012-2h0a2 2 0 012 2v3h4v-8zM9 18v2m6-2v2"/></svg>
);

export const HeartIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-5 h-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

export const HistoryIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
);

export const InfoIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
);

export const KitchenIcon: React.FC = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22a10 10 0 01-7.07-17.07l.5.5-2.82 2.83.7.7-2.83 2.83.7.7-1.42 1.41 3.54 3.54-1.41 1.41-2.12-2.12-.7.7 2.12 2.12-2.12 2.12.7.7 2.12-2.12 3.53 3.53.71-.7 2.83-2.83.7.7 2.83-2.83.71-.7-2.83-2.83.71-.71 2.83 2.83.7.7-2.83 2.83zm0 0a10 10 0 007.07-17.07l-.5-.5 2.82-2.83-.7-.7 2.83-2.83-.7-.7 1.42-1.41-3.54-3.54 1.41-1.41 2.12 2.12.7-.7-2.12-2.12 2.12-2.12-.7-.7-2.12 2.12-3.53-3.53-.71.7-2.83 2.83-.7-.7-2.83 2.83-.71.7 2.83 2.83-.7-.7 2.83 2.83z M12 6a2 2 0 100-4 2 2 0 000 4z"/></svg>;
export const LivingRoomIcon: React.FC = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18v8H3z M4 10V6a2 2 0 012-2h12a2 2 0 012 2v4M4 18v2m16-2v2"/></svg>;

export const LogoutIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
);

export const MessageIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
);

export const MoonIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
);

export const OfficeIcon: React.FC = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z M12 6V5a2 2 0 012-2h3m-5 18v-2a3 3 0 00-3-3H8a3 3 0 00-3 3v2"/></svg>;
export const PantryIcon: React.FC = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z M4 9h16 M4 14h16"/></svg>;

export const ProIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-5 h-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const ResetZoomIcon: React.FC = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
    </svg>
);

export const RulerIcon: React.FC = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15M9 15l6-6" />
    </svg>
);

export const SearchIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
);

export const ShareIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/></svg>
);

export const StoreIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6"/></svg>
);

export const SunIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 11-10 0 5 5 0 0110 0z"/></svg>
);

export const SwitchCameraIcon: React.FC = () => (
    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691L7.985 5.964M16.023 9.348A8.25 8.25 0 0119.5 12c0 .262.013.523.038.782m-15.015-1.121a8.25 8.25 0 0111.667 0l3.181 3.183" />
    </svg>
);

export const TagIcon: React.FC = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
);

export const TimerIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
);

export const ToolsIcon: React.FC = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.472-2.472a3.375 3.375 0 00-4.773-4.773L6.75 5.25l-2.472 2.472a3.375 3.375 0 004.773 4.773z" />
    </svg>
);

export const TrashIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
);

export const TrophyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-5 h-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9V9.75a4.5 4.5 0 019 0v9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5a3.75 3.75 0 10-7.5 0v4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 18.75h13.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 22.5h6" />
    </svg>
);

export const UsersIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
);

export const VideoIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
);

export const WhatsappIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.75 13.96c.25.13.43.2.5.33.07.14.07.54-.07.74-.14.2-.43.33-1.2.61-.77.27-1.4.2-1.93.07-.53-.13-1.27-.53-1.93-1.13-.93-.8-1.53-1.8-1.6-2.07-.07-.27-.07-.4-.07-.53l.27-.34c.07-.07.13-.13.2-.2.07-.06.13-.06.2-.06.07 0 .13.07.2.2.13.13.2.27.27.33.07.07.13.13.13.2 0 .07 0 .13-.07.2-.07.07-.13.13-.2.2l-.13.13c-.07.07-.13.13-.07.27s.2.4.4.61c.2.2.47.47.74.61c.26.13.4.2.61.27.2.07.33.07.4-.07l.2-.13c.07-.07.13-.13.27-.2.13-.07.27-.07.33-.07.14 0 .34.07.4.13zM12 2a10 10 0 100 20 10 10 0 000-20z m-3.14 15.63c.53.27 1.13.4 1.8.4.67 0 1.33-.13 1.93-.4l2.87.8-1.07-2.74a6.52 6.52 0 001.07-3.53c0-3.53-2.94-6.47-6.47-6.47-3.53 0-6.47 2.94-6.47 6.47 0 1.8.74 3.34 1.94 4.47l-.8 2.6z"/>
    </svg>
);

export const WineCellarIcon: React.FC = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 2H10C8.89543 2 8 2.89543 8 4V14C8 14.7956 8.31607 15.5587 8.87868 16.1213C9.44129 16.6839 10.2044 17 11 17H13C13.7956 17 14.5587 16.6839 15.1213 16.1213C15.6839 15.5587 16 14.7956 16 14V4C16 2.89543 15.1046 2 14 2Z M8 20H16"/></svg>;

export const ZoomInIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6"/></svg>
);

export const ZoomOutIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/></svg>
);

// --- MODALS ---
export const AlertModal: React.FC<{ state: AlertState; onClose: () => void }> = ({ state, onClose }) => {
  if (!state.show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-[#e6ddcd] dark:border-[#5a4f4f]">
          <h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e]">{state.title}</h2>
        </header>
        <main className="p-4">
          <p className="text-[#6a5f5f] dark:text-[#c7bca9]">{state.message}</p>
        </main>
        <footer className="p-4 flex justify-end">
          <button onClick={onClose} className="bg-[#3e3535] dark:bg-[#d4ac6e] text-white dark:text-[#3e3535] font-bold py-2 px-4 rounded hover:bg-[#2d2424] dark:hover:bg-[#c89f5e] transition">
            OK
          </button>
        </footer>
      </div>
    </div>
  );
};

export const ImageModal: React.FC<{ state: ImageModalState; onClose: () => void }> = ({ state, onClose }) => {
    if (!state.show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl">&times;</button>
        <img src={state.src} alt="Visualização ampliada" className="max-w-full max-h-full rounded-lg" />
      </div>
    );
};

export const ConfirmationModal: React.FC<{ show: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void }> = ({ show, title, message, onConfirm, onCancel }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn">
            <div className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg max-w-sm w-full shadow-xl">
                <header className="p-4 border-b border-[#e6ddcd] dark:border-[#5a4f4f]">
                    <h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e]">{title}</h2>
                </header>
                <main className="p-4">
                    <p className="text-[#6a5f5f] dark:text-[#c7bca9]">{message}</p>
                </main>
                <footer className="p-4 flex justify-end gap-3">
                    <button onClick={onCancel} className="bg-[#8a7e7e] dark:bg-[#5a4f4f] text-white font-bold py-2 px-4 rounded hover:bg-[#6a5f5f] dark:hover:bg-[#4a4040] transition">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition">
                        Confirmar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export const EarlyAccessModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg w-full max-w-lg shadow-xl border border-[#e6ddcd] dark:border-[#4a4040]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e]">{title}</h2>
                        <span className="text-xs font-semibold uppercase bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">Acesso Antecipado</span>
                    </div>
                    <button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};