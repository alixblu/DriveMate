import React from 'react';

export function Icon({ name }) {
  const commonProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: '2',
  };

  switch (name) {
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
          <path {...commonProps} d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );
    case 'wallet':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M4 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
          <path {...commonProps} d="M4 9V6a2 2 0 0 1 2-2h10" />
          <path {...commonProps} d="M15 13h5" />
        </svg>
      );
    case 'gift':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M20 12v8H4v-8" />
          <path {...commonProps} d="M2 8h20v4H2zM12 8v12" />
          <path {...commonProps} d="M12 8H8.5a2.5 2.5 0 1 1 0-5c2 0 3.5 2 3.5 5ZM12 8h3.5a2.5 2.5 0 1 0 0-5c-2 0-3.5 2-3.5 5Z" />
        </svg>
      );
    case 'link':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10 6" />
          <path {...commonProps} d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 1 0 7.07 7.07L14 18" />
        </svg>
      );
    case 'document':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path {...commonProps} d="M14 3v5h5M9 13h6M9 17h4" />
        </svg>
      );
    case 'route':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path {...commonProps} d="M7 14V6a3 3 0 0 1 3-3h4M17 10v8a3 3 0 0 1-3 3h-4" />
        </svg>
      );
    case 'rescue':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M12 3v18M3 12h18" />
          <circle {...commonProps} cx="12" cy="12" r="8" />
        </svg>
      );
    case 'fuel':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M7 20V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
          <path {...commonProps} d="M7 11h8M17 7h2l2 2v8a2 2 0 0 1-4 0v-4" />
        </svg>
      );
    case 'coffee':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M6 4h10a2 2 0 0 1 2 2v2a3 3 0 0 1-3 3h-1" />
          <path {...commonProps} d="M6 8v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8" />
          <path {...commonProps} d="M18 9h1a2 2 0 0 1 0 4h-2" />
        </svg>
      );
    case 'grid':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        </svg>
      );
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M3 10.5 12 3l9 7.5" />
          <path {...commonProps} d="M5 9.5V21h14V9.5" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="m12 3 1.8 4.7L18.5 9l-4.7 1.3L12 15l-1.8-4.7L5.5 9l4.7-1.3L12 3Z" />
          <path {...commonProps} d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
        </svg>
      );
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...commonProps} cx="12" cy="8" r="4" />
          <path {...commonProps} d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...commonProps} cx="12" cy="12" r="9" />
          <path {...commonProps} d="M12 7v5l3 2" />
        </svg>
      );
    case 'volume':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M5 14h3l4 4V6L8 10H5z" />
          <path {...commonProps} d="M16 9a5 5 0 0 1 0 6M18.5 6.5a8.5 8.5 0 0 1 0 11" />
        </svg>
      );
    case 'record':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="7" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'stop':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'close':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case 'mic':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            {...commonProps}
            d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z"
          />
          <path {...commonProps} d="M19 11a7 7 0 0 1-14 0" />
          <path {...commonProps} d="M12 18v3" />
        </svg>
      );
    case 'send':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            {...commonProps}
            d="m22 2-7 20-4-9-9-4 20-7Zm-11 11.2 5.6-5.6"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...commonProps} cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
