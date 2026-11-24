import { apiAxios } from '../lib/axios';

export interface Agency {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface JobSeeker {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  hobbies: string[];
  profileImage?: string;
  resume?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export const getAllAgencies = () => {
  return apiAxios.get('/user/agencies');
};

export const getJobSeekersByAgency = () => {
  return apiAxios.get('/user/job-seekers');
};

export const getAgencyDetails = () => {
  return apiAxios.get('/user/agency-details');
};

export const updateJobSeekerStatus = (userId: string, status: 'accepted' | 'declined') => {
  return apiAxios.put('/user/job-seeker-status', { userId, status });
};


