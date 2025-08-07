import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSpace } from '../services/spaceService';

const CreateSpace = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    about: '',
    url: '',
    joinPolicy: 1,
    visibility: 1,
    color: '#3498db',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'joinPolicy' || name === 'visibility' ? parseInt(value) : value,
    });
    
    // Clear field error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await createSpace(formData);
      const space = response.data.space;
      navigate(`/spaces/${space.url || space.id}`);
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to create space' });
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container-sm" style={{ paddingTop: '80px' }}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Create New Space</h2>
        </div>

        {errors.general && (
          <div className="error-message" style={{ margin: '0 20px 20px' }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Space Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-control ${errors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              maxLength="100"
            />
            {errors.name && (
              <div className="error-message">{errors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="url" className="form-label">
              Space URL (optional)
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '5px', color: '#7f8c8d' }}>
                /spaces/
              </span>
              <input
                type="text"
                id="url"
                name="url"
                className={`form-control ${errors.url ? 'error' : ''}`}
                value={formData.url}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="my-space"
                pattern="[a-zA-Z0-9-]+"
                title="Only letters, numbers, and hyphens allowed"
                maxLength="45"
              />
            </div>
            <small className="text-muted">
              Leave empty to auto-generate. Only letters, numbers, and hyphens allowed.
            </small>
            {errors.url && (
              <div className="error-message">{errors.url}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Short Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              className={`form-control ${errors.description ? 'error' : ''}`}
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              maxLength="500"
              placeholder="A brief description of your space"
            />
            {errors.description && (
              <div className="error-message">{errors.description}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="about" className="form-label">
              About (detailed description)
            </label>
            <textarea
              id="about"
              name="about"
              className={`form-control ${errors.about ? 'error' : ''}`}
              value={formData.about}
              onChange={handleChange}
              disabled={isLoading}
              rows="4"
              maxLength="1000"
              placeholder="Tell people what this space is about..."
            />
            {errors.about && (
              <div className="error-message">{errors.about}</div>
            )}
          </div>

          <div className="row">
            <div className="col-2">
              <div className="form-group">
                <label htmlFor="joinPolicy" className="form-label">
                  Join Policy
                </label>
                <select
                  id="joinPolicy"
                  name="joinPolicy"
                  className="form-control"
                  value={formData.joinPolicy}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value={0}>Invitation Only</option>
                  <option value={1}>Request to Join</option>
                  <option value={2}>Open to All</option>
                </select>
              </div>
            </div>
            
            <div className="col-2">
              <div className="form-group">
                <label htmlFor="visibility" className="form-label">
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  className="form-control"
                  value={formData.visibility}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value={0}>Private (members only)</option>
                  <option value={1}>Registered Users</option>
                  <option value={2}>Public (everyone)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="color" className="form-label">
              Space Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                disabled={isLoading}
                style={{ marginRight: '10px', width: '50px', height: '40px' }}
              />
              <input
                type="text"
                value={formData.color}
                onChange={handleChange}
                name="color"
                className="form-control"
                disabled={isLoading}
                pattern="^#[0-9A-Fa-f]{6}$"
                title="Must be a valid hex color (e.g., #3498db)"
              />
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/spaces')}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSpace;