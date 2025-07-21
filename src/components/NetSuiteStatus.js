import React, { useState } from 'react';
import axios from 'axios';
import './NetSuiteStatus.css';

const NetSuiteStatus = ({ order, onStatusUpdate }) => {
    const [retryLoading, setRetryLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleRetrySync = async () => {
        setRetryLoading(true);
        setStatusMessage('');

        try {
            const response = await axios.post(`/api/orders/${order.id}/retry-netsuite-sync`);
            
            if (response.data.success) {
                setStatusMessage('NetSuite sync completed successfully!');
                // Update order status in parent component
                if (onStatusUpdate) {
                    onStatusUpdate(order.id, 'CONFIRMED');
                }
            } else {
                setStatusMessage('NetSuite sync failed. Please try again later.');
            }
        } catch (error) {
            console.error('Error retrying NetSuite sync:', error);
            setStatusMessage('Error occurred while retrying sync. Please check logs.');
        } finally {
            setRetryLoading(false);
        }
    };

    const getStatusIcon = () => {
        switch (order.status) {
            case 'CONFIRMED':
                return '✅';
            case 'PENDING':
                return '⏳';
            case 'PROCESSING':
                return '🔄';
            case 'SHIPPED':
                return '🚚';
            case 'DELIVERED':
                return '📦';
            case 'CANCELLED':
                return '❌';
            default:
                return '❓';
        }
    };

    const getNetSuiteStatus = () => {
        if (order.notes && order.notes.includes('NetSuite Customer ID')) {
            return {
                synced: true,
                message: 'Successfully synced with NetSuite',
                details: order.notes
            };
        } else if (order.notes && order.notes.includes('NetSuite sync failed')) {
            return {
                synced: false,
                message: 'NetSuite sync failed',
                details: order.notes
            };
        } else if (order.status === 'PENDING') {
            return {
                synced: false,
                message: 'Pending NetSuite sync',
                details: 'Order is waiting to be synced with NetSuite'
            };
        } else {
            return {
                synced: true,
                message: 'Order confirmed',
                details: 'Order has been processed'
            };
        }
    };

    const netSuiteStatus = getNetSuiteStatus();

    return (
        <div className="netsuite-status">
            <div className="status-header">
                <span className="status-icon">{getStatusIcon()}</span>
                <div className="status-info">
                    <h4>Order Status: {order.status}</h4>
                    <p className={`netsuite-status-text ${netSuiteStatus.synced ? 'success' : 'warning'}`}>
                        {netSuiteStatus.message}
                    </p>
                </div>
            </div>

            {netSuiteStatus.details && (
                <div className="status-details">
                    <p><strong>Details:</strong> {netSuiteStatus.details}</p>
                </div>
            )}

            {!netSuiteStatus.synced && order.status === 'PENDING' && (
                <div className="retry-section">
                    <button 
                        className="retry-button"
                        onClick={handleRetrySync}
                        disabled={retryLoading}
                    >
                        {retryLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Retrying...
                            </>
                        ) : (
                            'Retry NetSuite Sync'
                        )}
                    </button>
                </div>
            )}

            {statusMessage && (
                <div className={`status-message ${statusMessage.includes('successfully') ? 'success' : 'error'}`}>
                    {statusMessage}
                </div>
            )}

            <div className="integration-info">
                <h5>NetSuite Integration Benefits:</h5>
                <ul>
                    <li>✅ Automatic customer creation in NetSuite</li>
                    <li>✅ Real-time sales order synchronization</li>
                    <li>✅ Centralized inventory management</li>
                    <li>✅ Seamless financial reporting</li>
                </ul>
            </div>
        </div>
    );
};

export default NetSuiteStatus;
