import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSpaces, joinSpace, toggleFollowSpace } from '../services/spaceService';

const Spaces = () => {
  const [spaces, setSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [search]);

  // Load spaces when debounced search changes
  useEffect(() => {
    loadSpaces();
  }, [debouncedSearch]);

  const loadSpaces = async () => {
    setIsLoading(true);
    try {
      const response = await getSpaces({ search: debouncedSearch, limit: 50 });
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
      const response = await joinSpace(spaceId);
      
      // Update the space's membership status locally
      setSpaces(prevSpaces => 
        prevSpaces.map(space => {
          if (space.id === spaceId) {
            return {
              ...space,
              isMember: response.data.isMember,
              membershipStatus: response.data.membershipStatus,
              isPending: response.data.isPending,
            };
          }
          return space;
        })
      );
      
      // Show success message
      if (response.data.isMember) {
        showSuccess('Successfully joined the space!', 'Space Joined');
      } else if (response.data.isPending) {
        showSuccess('Your request has been submitted and is pending approval.', 'Request Submitted');
      }
    } catch (error) {
      console.error('Error joining space:', error);
      showError(error.response?.data?.message || 'Error joining space', 'Error');
    }
    setActionLoading({ ...actionLoading, [spaceId]: false });
  };

  const handleFollowSpace = async (spaceId) => {
    if (actionLoading[spaceId]) return;
    
    setActionLoading({ ...actionLoading, [spaceId]: true });
    try {
      const response = await toggleFollowSpace(spaceId);
      // Update the local state instead of reloading all data
      setSpaces(prevSpaces => 
        prevSpaces.map(space => 
          space.id === spaceId 
            ? { ...space, isFollowing: response.data.isFollowing }
            : space
        )
      );
    } catch (error) {
      console.error('Error following space:', error);
      // Show user-friendly error message
      showError(error.response?.data?.message || 'Error following space. You might already be a member.', 'Error');
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

  const getMembershipButtonText = (space) => {
    if (space.isMember) {
      return 'Member';
    } else if (space.membershipStatus === 0) {
      return 'Request Sent';
    } else if (space.joinPolicy === 2) {
      return 'Join';
    } else {
      return 'Request to Join';
    }
  };

  const getMembershipButtonClass = (space) => {
    if (space.isMember) {
      return 'btn-success';
    } else if (space.membershipStatus === 0) {
      return 'btn-secondary';
    } else {
      return 'btn-primary';
    }
  };

  const isMembershipButtonDisabled = (space) => {
    return space.isMember || space.membershipStatus === 0;
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
                    {space.joinPolicy === 0 ? (
                      <span className="btn btn-secondary btn-sm" style={{ cursor: 'default' }}>
                        Invitation Only
                      </span>
                    ) : (
                      <div>
                        <button
                          className={`btn ${getMembershipButtonClass(space)} btn-sm`}
                          onClick={() => handleJoinSpace(space.id)}
                          disabled={actionLoading[space.id] || isMembershipButtonDisabled(space)}
                          style={{ marginBottom: '5px', width: '100%' }}
                        >
                          {actionLoading[space.id] ? 'Processing...' : getMembershipButtonText(space)}
                        </button>
                        
                        {!space.isMember && space.membershipStatus === null && (
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