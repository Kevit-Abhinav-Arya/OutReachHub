import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopContactTags } from '../slices/analyticsSlice';
import type { RootState } from '@/store';
import type { AppDispatch } from '@/store';
import type { TopContactTag } from '../types/analytics.types';

const TopContactTagsTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.analytics.topTags
  );

  useEffect(() => {
    dispatch(fetchTopContactTags());
  }, [dispatch]);

  if (loading) {
    return (
      <table>
        <thead>
          <tr>
            <th scope="col">Tag</th>
            <th scope="col">Contacts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={2} style={{ textAlign: 'center', padding: '2rem' }}>
              Loading tags...
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
            <th scope="col">Tag</th>
            <th scope="col">Contacts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={2} style={{ textAlign: 'center', padding: '2rem', color: '#ff6b6b' }}>
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
            <th scope="col">Tag</th>
            <th scope="col">Contacts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={2} style={{ textAlign: 'center', padding: '2rem' }}>
              No tags found
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
          <th scope="col">Tag</th>
          <th scope="col">Contacts</th>
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 5).map((tag: TopContactTag) => (
          <tr key={tag._id}>
            <td>{tag._id}</td>
            <td>{tag.contactCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TopContactTagsTable;