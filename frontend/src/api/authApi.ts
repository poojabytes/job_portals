import { apiAxios } from '../lib/axios';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  userType: 'Job Seeker' | 'Agency';
  hobbies?: string[];
  agencyId?: string;
  profileImage?: string; // File path (filename) from upload endpoint
  resume?: string; // File path (filename) from upload endpoint
}

// Response structure from backend after interceptor (response.data)
export interface UploadFilesResponse {
  statusCode: number;
  message: string;
  data: {
    files: {
      profileImage?: {
        filename: string;
        path: string;
        url: string;
      };
      resume?: {
        filename: string;
        path: string;
        url: string;
      };
    };
  };
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface SetPasswordData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Upload files (profile image and resume)
export const uploadFiles = (files: { profileImage?: File; resume?: File }) => {
  const formData = new FormData();

  let hasFiles = false;

  // Append files with the exact field names expected by the backend
  if (files.profileImage instanceof File) {
    formData.append('profileImage', files.profileImage, files.profileImage.name);
    hasFiles = true;
    console.log('Appending profileImage:', files.profileImage.name, files.profileImage.type);
  }

  if (files.resume instanceof File) {
    formData.append('resume', files.resume, files.resume.name);
    hasFiles = true;
    console.log('Appending resume:', files.resume.name, files.resume.type);
  }

  if (!hasFiles) {
    throw new Error('No valid files to upload');
  }

  // Log FormData contents for debugging
  console.log('FormData entries:');
  for (const [key, value] of formData.entries()) {
    console.log(key, value instanceof File ? `File: ${value.name} (${value.type})` : value);
  }

  // Axios will automatically set Content-Type with boundary for FormData
  // Response interceptor returns response.data directly
  return apiAxios.post('/auth/upload', formData) as Promise<UploadFilesResponse>;
};

// Register user (now accepts file paths instead of files)
export const registerUser = (data: RegisterData) => {
  return apiAxios.post('/auth/register', data);
};

export const verifyOTP = (data: VerifyOTPData) => {
  return apiAxios.post('/auth/verify-otp', data);
};

export const resendOTP = (email: string) => {
  return apiAxios.post('/auth/resend-otp', { email });
};

export const setPassword = (data: SetPasswordData) => {
  return apiAxios.post('/auth/set-password', data);
};

export const loginUser = (data: LoginData) => {
  return apiAxios.post('/auth/login', data);
};


