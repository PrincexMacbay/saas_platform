import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSpaces, joinSpace, toggleFollowSpace } from '../services/spaceService';

const Spaces = () => {
  const [spaces, setSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadSpaces();
  }, [search]);

  const loadSpaces = async () => {
    setIsLoading(true);
    try {
      const response = await getSpaces({ search, limit: 50 });
      setSpaces(response.data.spaces);
    } catch (error) {
      console.error('Error loading spaces:', error);
    }
    setIsLoading(false);
  };

  const handleJoinSpace = async (spaceId) => {
    if (actionLoading[spaceId]) return;
    
    setActionLoading({ ...actionLoading, [spaceId]: true });
    try {
      await joinSpace(spaceId);
      loadSpaces(); // Reload to update membership status
    } catch (error) {
      console.error('Error joining space:', error);
    }
    setActionLoading({ ...actionLoading, [spaceId]: false });
  };

  const handleFollowSpace = async (spaceId) => {
    if (actionLoading[spaceId]) return;
    
    setActionLoading({ ...actionLoading, [spaceId]: true });
    try {
      await toggleFollowSpace(spaceId);
      loadSpaces(); // Reload to update follow status
    } catch (error) {
      console.error('Error following space:', error);
    }
    setActionLoading({ ...actionLoading, [spaceId]: false });
  };

  const getJoinPolicyText = (joinPolicy) => {
    switch (joinPolicy) {
      case 0: return 'Invitation Only';
      case 1: return 'Request to Join';
      case 2: return 'Open to All';
      default: return 'Unknown';
    }
  };

  const getVisibilityText = (visibility) => {
    switch (visibility) {
      case 0: return 'Private';
      case 1: return 'Members Only';
      case 2: return 'Public';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="container text-center" style={{ paddingTop: '100px' }}>
        <div className="spinner"></div>
        <p>Loading spaces...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '80px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Spaces</h2>
        <Link to="/spaces/create" className="btn btn-primary">
          <i className="fas fa-plus"></i> Create Space
        </Link>
      </div>

      <div className="row mb-4">
        <div className="col">
          <input
            type="text"
            className="form-control"
            placeholder="Search spaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        {spaces.length === 0 ? (
          <div className="col">
            <div className="card text-center">
              <p>No spaces found. {search ? 'Try a different search term.' : 'Create the first space!'}</p>
            </div>
          </div>
        ) : (
          spaces.map((space) => (
            <div key={space.id} className="col-4">
              <div className="space-card">
                <div className="space-header">
                  <div className="d-flex align-items-center mb-2">
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '5px',
                      backgroundColor: space.color || '#3498db',
                      marginRight: '10px'
                    }}></div>
                    <div>
                      <Link 
                        to={`/spaces/${space.url || space.id}`} 
                        className="space-name"
                        style={{ textDecoration: 'none' }}
                      >
                        {space.name}
                      </Link>
                    </div>
                  </div>
                  
                  {space.description && (
                    <p className="space-description">{space.description}</p>
                  )}
                </div>

                <div className="space-meta">
                  <div className="space-stats">
                    <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                      <i className="fas fa-users"></i> {space.members?.length || 0} members
                    </div>
                    <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                      <i className="fas fa-eye"></i> {getVisibilityText(space.visibility)}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <i className="fas fa-door-open"></i> {getJoinPolicyText(space.joinPolicy)}
                    </div>
                  </div>

                  <div>
                    {space.isMember ? (
                      <span className="btn btn-success btn-sm" style={{ cursor: 'default' }}>
                        <i className="fas fa-check"></i> Member
                      </span>
                    ) : space.joinPolicy === 0 ? (
                      <span className="btn btn-secondary btn-sm" style={{ cursor: 'default' }}>
                        Invitation Only
                      </span>
                    ) : (
                      <div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleJoinSpace(space.id)}
                          disabled={actionLoading[space.id]}
                          style={{ marginBottom: '5px', width: '100%' }}
                        >
                          {actionLoading[space.id] ? 'Joining...' : 
                           space.joinPolicy === 2 ? 'Join' : 'Request to Join'}
                        </button>
                        
                        {!space.isMember && (
                          <button
                            className={`btn btn-sm ${space.isFollowing ? 'btn-secondary' : 'btn-outline'}`}
                            onClick={() => handleFollowSpace(space.id)}
                            disabled={actionLoading[space.id]}
                            style={{ width: '100%' }}
                          >
                            {space.isFollowing ? 'Unfollow' : 'Follow'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Spaces;