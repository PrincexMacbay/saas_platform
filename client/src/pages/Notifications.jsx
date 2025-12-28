import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import './Notifications.css';

const Notifications = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { markAsRead, markAllAsRead } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const limit = 20;

  useEffect(() => {
    loadNotifications();
  }, [filter, typeFilter, dateFilter, currentPage]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit,
        unreadOnly: filter === 'unread' ? 'true' : 'false'
      };

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      // Add date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          default:
            break;
        }
        
        params.startDate = startDate.toISOString();
        params.endDate = now.toISOString();
      }

      const response = await api.get('/notifications', { params });
      
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotal(response.data.data.pagination.total);
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('🔔 Notification clicked:', {
      id: notification.id,
      type: notification.type,
      link: notification.link,
      read: notification.read
    });
    
    if (!notification.read) {
      await markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true, readAt: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    // Navigate to the link if provided
    if (notification.link) {
      console.log('🧭 Navigating to:', notification.link);
      // Use replace: false to allow back button, but ensure navigation happens
      navigate(notification.link, { replace: false });
    } else {
      console.warn('⚠️ No link provided for notification:', notification.type);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notifications.find(n => n.id === notificationId && !n.read)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
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

  const formatFullDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'application_submitted': 'fa-file-alt',
      'job_application_submitted': 'fa-briefcase',
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

  const getNotificationTypeLabel = (type) => {
    const labels = {
      'application_submitted': 'Application Submitted',
      'job_application_submitted': 'New Job Application',
      'application_approved': 'Application Approved',
      'application_rejected': 'Application Rejected',
      'new_comment': 'Comment',
      'new_follower': 'Follower',
      'payment_received': 'Payment Received',
      'payment_due': 'Payment Due',
      'job_application_status': 'Job Application',
      'space_invitation': 'Space Invitation',
      'mention': 'Mention',
      'post_liked': 'Post Liked',
      'comment_liked': 'Comment Liked'
    };
    return labels[type] || 'Other';
  };

  const notificationTypes = [
    'all',
    'application_submitted',
    'job_application_submitted',
    'application_approved',
    'application_rejected',
    'new_comment',
    'new_follower',
    'payment_received',
    'payment_due',
    'post_liked',
    'job_application_status'
  ];

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="mark-all-read-btn"
            >
              <i className="fas fa-check-double"></i> Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="notifications-filters">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filter} 
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All ({total})</option>
              <option value="unread">Unread ({unreadCount})</option>
              <option value="read">Read ({total - unreadCount})</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Type:</label>
            <select 
              value={typeFilter} 
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Types</option>
              {notificationTypes.filter(t => t !== 'all').map(type => (
                <option key={type} value={type}>
                  {getNotificationTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date:</label>
            <select 
              value={dateFilter} 
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={loadNotifications}>Retry</button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">
            <i className="fas fa-bell-slash"></i>
            <p>No notifications found</p>
            <p className="no-notifications-subtitle">
              {filter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <div className="notification-title">{notification.title}</div>
                      <button
                        className="delete-notification-btn"
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        title="Delete notification"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-footer">
                      <span className="notification-type-badge">
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                      <span className="notification-time">
                        {formatTime(notification.createdAt)}
                      </span>
                      {notification.readAt && (
                        <span className="notification-read-time">
                          Read {formatTime(notification.readAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="notifications-pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
