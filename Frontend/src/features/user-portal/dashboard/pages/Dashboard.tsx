import React from 'react';
import CampaignsChart from '../components/CampaignsChart';
import MessagesChart from '../components/MessagesChart';
import ContactsChart from '../components/ContactsChart';
import RecentCampaignsTable from '../components/RecentCampaignsTable';
import TopContactTagsTable from '../components/TopContactTagsTable';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  return (
    <main>
      <section className="hero-section">
        <h1>Welcome to OutReachHub</h1>
        <p>
          A modern SaaS platform for managing contacts, message templates, and targeted campaigns. 
          Get insights, manage your workspace, and launch campaigns with ease.
        </p>
      </section>

      <section className="features-row">
        <div className="feature-card">
          <div className="feature-flex">
            <div className="chart-corner">
              <CampaignsChart className="chart-img" />
            </div>
            <div className="feature-content">
              <h3>Campaigns per Day</h3>
              <p>Track the number of campaigns launched each day.</p>
            </div>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-flex">
            <div className="chart-corner">
              <MessagesChart className="chart-img" />
            </div>
            <div className="feature-content">
              <h3>Messages Sent per Type</h3>
              <p>Analyze message volume by type for better targeting.</p>
            </div>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-flex">
            <div className="chart-corner">
              <ContactsChart className="chart-img" />
            </div>
            <div className="feature-content">
              <h3>Contacts Reached per Day</h3>
              <p>See how many contacts are reached daily by your campaigns.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="tables-row">
        <div className="table">
          <h3>Recent Campaigns</h3>
          <RecentCampaignsTable />
        </div>

        <div className="table">
          <h3>Top Tags</h3>
          <TopContactTagsTable />
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
