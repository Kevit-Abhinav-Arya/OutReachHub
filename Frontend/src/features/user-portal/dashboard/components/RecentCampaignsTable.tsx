import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentCampaigns } from '../slices/analyticsSlice';
import type { RootState } from '@/store';
import type { AppDispatch } from '@/store';
import type { RecentCampaign } from '../types/analytics.types';

const RecentCampaignsTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.analytics.recentCampaigns
  );

  useEffect(() => {
    dispatch(fetchRecentCampaigns());
  }, [dispatch]);

  const getStatusClass = (status: string) => {
    const statusClasses = {
      'Active': 'running',
      'Completed': 'completed',
      'Draft': 'draft',
    };
    
    return statusClasses[status as keyof typeof statusClasses] || 'draft';
  };

  if (loading) {
    return (
      <table>
        <thead>
          <tr>
            <th scope="col">Campaign Name</th>
            <th scope="col">Targeted Tags</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>
              Loading campaigns...
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  if (error) {
    return (
      <table>
        <thead>
          <tr>
            <th scope="col">Campaign Name</th>
            <th scope="col">Targeted Tags</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#ff6b6b' }}>
              Error: {error}
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  if (data.length === 0) {
    return (
      <table>
        <thead>
          <tr>
            <th scope="col">Campaign Name</th>
            <th scope="col">Targeted Tags</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>
              No campaigns found
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Campaign Name</th>
          <th scope="col">Targeted Tags</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 5).map((campaign: RecentCampaign) => (
          <tr key={campaign._id}>
            <td>{campaign.name}</td>
            <td>
              {campaign.targetTags.length > 0 
                ? campaign.targetTags.slice(0, 2).join(', ')
                : 'No tags'
              }
              {campaign.targetTags.length > 2 && ` +${campaign.targetTags.length - 2} more`}
            </td>
            <td>
              <span className={`status ${getStatusClass(campaign.status)}`}>
                {campaign.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RecentCampaignsTable;