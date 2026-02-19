// src/components/jobs/JobCard.tsx
import React, { useState } from 'react';
import { databaseService } from '../../services/database';
import { useAuth } from '../../hooks/useAuth';
import { useErrorHandler } from '../../utils/errorHandler';
import type { Job } from '../../types';

interface JobCardProps {
    job: Job;
    onApplicationSent?: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApplicationSent }) => {
  const [applying, setApplying] = useState(false);
  const { user } = useAuth();
  const { logJobApplicationError } = useErrorHandler();

  const handleQuickApply = async () => {
    if (!user) return;
    setApplying(true);
    try {
      console.log('🚀 Quick applying to job:', job.$id);
      
      const applicationData = {
        jobId: job.$id,
        applicantId: user.$id,
        coverLetter: `Hello, I am interested in the ${job.title} position. My qualifications and experience are an excellent match for the requirements.`,
        status: 'pending'
      };

      await databaseService.createApplication(applicationData);
      console.log('✅ Quick application sent');
      
      alert('Application sent successfully!');
      onApplicationSent?.(job.$id);
      
    } catch (error) {
      logJobApplicationError(error as Error, job.$id);
      alert('Error sending application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'To be agreed';
    if (min && max) return `€${min} - €${max}`;
    if (min) return `From €${min}`;
    return `Up to €${max}`;
  };
  
  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT');
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-info">
          <h3>{job.title}</h3>
          <p className="company">{job.structureName || job.structureId} • {job.city}</p>
          <div className="job-details">
            <span className="salary">{formatSalary(job.salaryMin, job.salaryMax)}</span>
            <span className="contract">{job.contractType}</span>
            <span className="posted">📅 {formatDate(job.$createdAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="job-description">
        <p>{job.description.substring(0, 150)}...</p>
      </div>
      
      <div className="job-actions">
        <button onClick={handleQuickApply} disabled={applying} className="apply-quick-btn">
          {applying ? '📤 Sending...' : '⚡ Quick Apply'}
        </button>
        <button className="apply-custom-btn">✍️ Custom Apply</button>
      </div>
    </div>
  );
};

export default JobCard;
