import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS/Maintenance.css';
import Navbar from './Navbar';

const Maintenance = () => {
  const [issues, setIssues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: '', description: '', status: 'Open' });
  const [userProfile, setUserProfile] = useState({});
  const [categoryCounts, setCategoryCounts] = useState({
    Plumbing: 0,
    Electrical: 0,
    Carpentry: 0,
    Other: 0
  });

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchProfileAndIssues();
  }, []);

  const fetchProfileAndIssues = async () => {
    try {
      const profileRes = await axios.get('http://localhost:5000/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile = profileRes.data;
      setUserProfile(profile);

      const issueRes = await axios.get('http://localhost:5000/resident-issues', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let allIssues = Array.isArray(issueRes.data) ? issueRes.data : [];

      const specializationToCategoryMap = {
        plumber: 'plumbing',
        electrician: 'electrical',
        carpenter: 'carpentry',
        other: 'other'
      };

      if (profile.role === 'maintenance' && profile.specialization) {
        const specializationKey = profile.specialization.toLowerCase();
        const matchCategory = specializationToCategoryMap[specializationKey];
        allIssues = allIssues.filter(issue =>
          issue.category?.toLowerCase() === matchCategory
        );
      }

      // Filter out closed issues
      allIssues = allIssues.filter(issue => issue.status !== 'Closed');

      const newCounts = {
        Plumbing: 0,
        Electrical: 0,
        Carpentry: 0,
        Other: 0
      };

      allIssues.forEach(issue => {
        const cat = issue.category?.toLowerCase();
        if (cat === 'plumbing') newCounts.Plumbing++;
        else if (cat === 'electrical') newCounts.Electrical++;
        else if (cat === 'carpentry') newCounts.Carpentry++;
        else newCounts.Other++;
      });

      setCategoryCounts(newCounts);
      setIssues(allIssues);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newIssue = {
      ...form,
      resident_id: userId,
      flat: userProfile.flat || '',
      block: userProfile.block || ''
    };

    try {
      await axios.post('http://localhost:5000/resident-issues', newIssue, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProfileAndIssues();
      setForm({ category: '', description: '', status: 'Open' });
      setShowForm(false);
    } catch (err) {
      console.error('Error submitting issue:', err);
    }
  };

  const updateStatus = async (issueId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/maintenance/issues/${issueId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProfileAndIssues();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="page-content">
      <Navbar />
      <div className="maintenance-container">
        <h2 className="maintenance-title">Maintenance Issues</h2>

        {(role === 'admin' || role === 'maintenance') && (
          <div className="category-summary">
            <div className="summary-box plumbing">🔧 Plumbing: {categoryCounts.Plumbing}</div>
            <div className="summary-box electrical">💡 Electrical: {categoryCounts.Electrical}</div>
            <div className="summary-box carpentry">🪚 Carpentry: {categoryCounts.Carpentry}</div>
            <div className="summary-box other">📦 Other: {categoryCounts.Other}</div>
          </div>
        )}

        {(role === 'admin' || role === 'resident') && (
          <>
            <button onClick={() => setShowForm(!showForm)} className="create-issue-btn">
              {showForm ? '➖ Cancel' : '➕ Create Issue'}
            </button>

            {showForm && (
              <div className="form-section">
                <h3 className="form-title">Report a New Issue</h3>
                <form onSubmit={handleSubmit} className="issue-form">

                  <div className="form-group">
                    <label>Block</label>
                    <input type="text" value={userProfile.block || 'N/A'} readOnly />
                  </div>

                  <div className="form-group">
                    <label>Flat</label>
                    <input type="text" value={userProfile.flat || 'N/A'} readOnly />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      placeholder="Describe the issue"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="submit-btn">🛠 Report Issue</button>
                </form>
              </div>
            )}
          </>
        )}

        <div className="issue-list">
          {issues.map(issue => (
            <div className="issue-card" key={issue._id}>
              <h4>{issue.category}</h4>
              <p className="desc">{issue.description}</p>
              <p><strong>Status:</strong> {issue.status}</p>
              <p><strong>Block:</strong> {issue.block || 'N/A'}</p>
              <p><strong>Flat:</strong> {issue.flat || 'N/A'}</p>

              {role === 'maintenance' && (
                <div className="status-update">
                  <label>Update Status:</label>
                  <select
                    value={issue.status}
                    onChange={e => updateStatus(issue._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              )}

              <p className="timestamp">
                <small>Updated: {issue.updated_at ? new Date(issue.updated_at).toLocaleString() : 'N/A'}</small>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
