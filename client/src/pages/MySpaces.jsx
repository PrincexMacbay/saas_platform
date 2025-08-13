import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSpaces } from '../services/spaceService';
import { useAuth } from '../contexts/AuthContext';

const MySpaces = () => {
  const [ownedSpaces, setOwnedSpaces] = useState([]);
  const [joinedSpaces, setJoinedSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('owned');
  const { user } = useAuth();

  useEffect(() => {
    loadMySpaces();
  }, []);

  const loadMySpaces = async () => {
    setIsLoading(true);
    try {
      // Load owned spaces
      const ownedResponse = await getSpaces({ ownerId: user.id, limit: 50 });
      setOwnedSpaces(ownedResponse.data.spaces);

      // Load joined spaces (excluding owned ones)
      const joinedResponse = await getSpaces({ memberId: user.id, limit: 50 });
      const filteredJoined = joinedResponse.data.spaces.filter(
        space => space.ownerId !== user.id
      );
      setJoinedSpaces(filteredJoined);
    } catch (error) {
      console.error('Error loading my spaces:', error);
    }
    setIsLoading(false);
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

  const getMembershipStatusText = (status) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Member';
      case 2: return 'Moderator';
      case 3: return 'Admin';
      case 4: return 'Owner';
      default: return 'Unknown';
    }
  };

  const getMembershipStatusColor = (status) => {
    switch (status) {
      case 0: return 'warning';
      case 1: return 'success';
      case 2: return 'info';
      case 3: return 'primary';
      case 4: return 'secondary';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="container text-center" style={{ paddingTop: '100px' }}>
        <div className="spinner"></div>
        <p>Loading your spaces...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '80px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Spaces</h2>
        <Link to="/spaces/create" className="btn btn-primary">
          <i className="fas fa-plus"></i> Create New Space
        </Link>
      </div>

      {/* Tabs */}
      <div className="card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'owned' ? 'active' : ''}`}
                onClick={() => setActiveTab('owned')}
              >
                <i className="fas fa-crown me-2"></i> Owned Spaces ({ownedSpaces.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'joined' ? 'active' : ''}`}
                onClick={() => setActiveTab('joined')}
              >
                <i className="fas fa-users me-2"></i> Joined Spaces ({joinedSpaces.length})
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {/* Owned Spaces Tab */}
          {activeTab === 'owned' && (
            <div>
              <h4>Spaces You Own</h4>
              {ownedSpaces.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-crown fa-3x text-muted mb-3"></i>
                  <h5>No spaces owned yet</h5>
                  <p className="text-muted">Create your first space to get started.</p>
                  <Link to="/spaces/create" className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i> Create Space
                  </Link>
                </div>
              ) : (
                <div className="row">
                  {ownedSpaces.map((space) => (
                    <div key={space.id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0">{space.name}</h6>
                            <span className={`badge bg-${getMembershipStatusColor(4)}`}>
                              Owner
                            </span>
                          </div>
                          <p className="card-text text-muted small">
                            {space.description && space.description.length > 100 
                              ? `${space.description.substring(0, 100)}...` 
                              : space.description}
                          </p>
                          <div className="mb-3">
                            <div className="row text-muted small">
                              <div className="col-6">
                                <i className="fas fa-users"></i> {space.membersCount || 0} members
                              </div>
                              <div className="col-6">
                                <i className="fas fa-eye"></i> {getVisibilityText(space.visibility)}
                              </div>
                            </div>
                            <div className="row text-muted small mt-1">
                              <div className="col-6">
                                <i className="fas fa-sign-in-alt"></i> {getJoinPolicyText(space.joinPolicy)}
                              </div>
                              <div className="col-6">
                                <i className="fas fa-calendar"></i> {new Date(space.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <a href={`/spaces/${space.url || space.id}`} className="btn btn-primary btn-sm flex-fill">
                              <i className="fas fa-eye me-1"></i> View
                            </a>
                            <a href={`/spaces/${space.url || space.id}/manage`} className="btn btn-outline-secondary btn-sm">
                              <i className="fas fa-cog"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Joined Spaces Tab */}
          {activeTab === 'joined' && (
            <div>
              <h4>Spaces You've Joined</h4>
              {joinedSpaces.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <h5>No spaces joined yet</h5>
                  <p className="text-muted">Explore and join interesting spaces to connect with others.</p>
                  <Link to="/spaces" className="btn btn-primary">
                    <i className="fas fa-search me-2"></i> Browse Spaces
                  </Link>
                </div>
              ) : (
                <div className="row">
                  {joinedSpaces.map((space) => (
                    <div key={space.id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0">{space.name}</h6>
                            <span className={`badge bg-${getMembershipStatusColor(space.membershipStatus || 1)}`}>
                              {getMembershipStatusText(space.membershipStatus || 1)}
                            </span>
                          </div>
                          <p className="card-text text-muted small">
                            {space.description && space.description.length > 100 
                              ? `${space.description.substring(0, 100)}...` 
                              : space.description}
                          </p>
                          <div className="mb-3">
                            <div className="row text-muted small">
                              <div className="col-6">
                                <i className="fas fa-users"></i> {space.membersCount || 0} members
                              </div>
                              <div className="col-6">
                                <i className="fas fa-eye"></i> {getVisibilityText(space.visibility)}
                              </div>
                            </div>
                            <div className="row text-muted small mt-1">
                              <div className="col-6">
                                <i className="fas fa-user"></i> {space.owner?.firstName || space.owner?.username}
                              </div>
                              <div className="col-6">
                                <i className="fas fa-calendar"></i> {new Date(space.membershipCreatedAt || space.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <a href={`/spaces/${space.url || space.id}`} className="btn btn-primary btn-sm flex-fill">
                              <i className="fas fa-eye me-1"></i> View
                            </a>
                            <button className="btn btn-outline-danger btn-sm">
                              <i className="fas fa-sign-out-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySpaces;
