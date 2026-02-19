import React, { useState, useEffect } from 'react';
import { JobCard } from '../../components/JobCard';
import { LavoroView } from '../../components/LavoroView';
import { databaseService } from '../services/database';
import type { Job, MockJob } from '../../types';
import { Models } from 'appwrite';
import { JOBS } from '../utils/mockData';


const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // const response = await databaseService.getJobs({ isActive: true });
        // setJobs(response.documents);
        setJobs(JOBS); // Use mock data for now
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);


  return (
    <LavoroView onSelectJob={() => {}} onApply={() => {}} onShowMyApplications={() => {}} />
  );
};

export default Jobs;