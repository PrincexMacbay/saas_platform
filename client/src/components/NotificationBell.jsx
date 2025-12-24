import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    console.log('🔔 NotificationBell: Notification clicked', {
      id: notification.id,
      type: notification.type,
      link: notification.link,
      read: notification.read
    });
    
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    
    // Navigate to the link if provided
    if (notification.link) {
      console.log('🧭 NotificationBell: Navigating to:', notification.link);
      // Use replace: false to allow back button, but ensure navigation happens
      navigate(notification.link, { replace: false });
    } else {
      console.warn('⚠️ NotificationBell: No link provided for notification:', notification.type);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'application_submitted': 'fa-file-alt',
      'application_approved': 'fa-check-circle',
      'application_rejected': 'fa-times-circle',
      'new_comment': 'fa-comment',
      'new_follower': 'fa-user-plus',
      'payment_received': 'fa-dollar-sign',
      'payment_due': 'fa-exclamation-circle',
      'job_application_status': 'fa-briefcase',
      'space_invitation': 'fa-users',
      'mention': 'fa-at',
      'post_liked': 'fa-heart',
      'comment_liked': 'fa-heart'
    };
    return icons[type] || 'fa-bell';
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.createdAt)}</div>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>

          <Link 
            to="/notifications" 
            className="view-all-notifications"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-arrow-right"></i> View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
