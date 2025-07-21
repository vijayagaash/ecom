import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NetSuiteOAuth.css';

const NetSuiteOAuth = () => {
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorizing, setAuthorizing] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('oauth_success');
    const oauthError = urlParams.get('oauth_error');
    
    if (oauthSuccess === 'true') {
      alert('NetSuite OAuth 2.0 authorization successful!');
      checkAuthStatus();
    } else if (oauthError) {
      alert(`NetSuite OAuth 2.0 authorization failed: ${oauthError}`);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/netsuite/oauth/status');
      setAuthStatus(response.data);
    } catch (error) {
      console.error('Error checking OAuth status:', error);
      setAuthStatus({ authorized: false, error: 'Failed to check status' });
    } finally {
      setLoading(false);
    }
  };

  const initiateAuthorization = async () => {
    try {
      setAuthorizing(true);
      const response = await axios.get('http://localhost:8080/api/netsuite/oauth/authorize');
      
      // Redirect to NetSuite authorization URL
      window.location.href = response.data.authorizationUrl;
    } catch (error) {
      console.error('Error initiating authorization:', error);
      alert('Failed to initiate NetSuite authorization');
    } finally {
      setAuthorizing(false);
    }
  };

  const refreshToken = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8080/api/netsuite/oauth/refresh');
      
      if (response.data.success) {
        alert('Token refreshed successfully');
        checkAuthStatus();
      } else {
        alert('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      alert('Failed to refresh token');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/netsuite/oauth/test');
      
      if (response.data.success) {
        alert('NetSuite connection test successful!');
      } else {
        alert(`NetSuite connection test failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('Failed to test NetSuite connection');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !authStatus) {
    return (
      <div className="netsuite-oauth-container">
        <div className="loading">Loading NetSuite authorization status...</div>
      </div>
    );
  }

  return (
    <div className="netsuite-oauth-container">
      <div className="oauth-header">
        <h2>NetSuite OAuth 2.0 Integration</h2>
        <button 
          onClick={checkAuthStatus} 
          className="refresh-btn"
          disabled={loading}
        >
          🔄 Refresh Status
        </button>
      </div>

      <div className="oauth-status">
        <div className={`status-indicator ${authStatus?.authorized ? 'authorized' : 'unauthorized'}`}>
          <div className="status-dot"></div>
          <span>
            {authStatus?.authorized ? 'Authorized' : 'Not Authorized'}
          </span>
        </div>

        {authStatus && (
          <div className="status-details">
            <div className="detail-item">
              <span className="label">Access Token:</span>
              <span className={`value ${authStatus.hasAccessToken ? 'has-token' : 'no-token'}`}>
                {authStatus.hasAccessToken ? '✓ Available' : '✗ Not Available'}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="label">Refresh Token:</span>
              <span className={`value ${authStatus.hasRefreshToken ? 'has-token' : 'no-token'}`}>
                {authStatus.hasRefreshToken ? '✓ Available' : '✗ Not Available'}
              </span>
            </div>
            
            {authStatus.tokenExpiry && (
              <div className="detail-item">
                <span className="label">Token Expires:</span>
                <span className="value">
                  {new Date(authStatus.tokenExpiry).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="oauth-actions">
        {!authStatus?.authorized ? (
          <button 
            onClick={initiateAuthorization}
            className="btn-primary"
            disabled={authorizing}
          >
            {authorizing ? 'Redirecting...' : '🔑 Authorize NetSuite Access'}
          </button>
        ) : (
          <div className="authorized-actions">
            <button 
              onClick={testConnection}
              className="btn-secondary"
              disabled={loading}
            >
              🧪 Test Connection
            </button>
            
            <button 
              onClick={refreshToken}
              className="btn-secondary"
              disabled={loading || !authStatus.hasRefreshToken}
            >
              🔄 Refresh Token
            </button>
          </div>
        )}
      </div>

      <div className="oauth-info">
        <h3>About NetSuite OAuth 2.0</h3>
        <ul>
          <li>OAuth 2.0 provides secure authentication without sharing credentials</li>
          <li>Access tokens expire automatically for enhanced security</li>
          <li>Refresh tokens allow automatic token renewal</li>
          <li>Orders will be synced with NetSuite when authorized</li>
        </ul>
        
        {!authStatus?.authorized && (
          <div className="setup-instructions">
            <h4>Setup Instructions:</h4>
            <ol>
              <li>Configure your NetSuite OAuth 2.0 application</li>
              <li>Update application.properties with your NetSuite credentials</li>
              <li>Set <code>netsuite.use.oauth2=true</code> in configuration</li>
              <li>Click "Authorize NetSuite Access" to begin authentication</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetSuiteOAuth;
