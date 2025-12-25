import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';

const ChatIcon = () => {
  const location = useLocation();
  const { unreadCount } = useChat();
  const isActive = location.pathname === '/messages';

  return (
    <div className="chat-icon-container" style={{ position: 'relative' }}>
      <Link 
        to="/messages" 
        className={`nav-link-icon ${isActive ? 'active' : ''}`}
        title="Messages"
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '8px',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <i className="fas fa-comments"></i>
        {unreadCount?.total > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#e74c3c',
            color: 'white',
            borderRadius: '10px',
            padding: '2px 6px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            minWidth: '18px',
            textAlign: 'center',
            lineHeight: '1.2'
          }}>
            {unreadCount.total > 99 ? '99+' : unreadCount.total}
          </span>
        )}
      </Link>
    </div>
  );
};

export default ChatIcon;
