const apiFromEnv = import.meta.env.VITE_API_URL as string | undefined;
const backendFromEnv = import.meta.env.VITE_BACKEND_URL as string | undefined;

const local = {
  apiUrl: apiFromEnv || 'http://localhost:4043/api/v1',
  backendUrl: backendFromEnv || 'http://localhost:4043',
};

const staging = {
  apiUrl: apiFromEnv || 'http://localhost:4043/api/v1',
  backendUrl: backendFromEnv || 'http://localhost:4043',
};

const production = {
  apiUrl: apiFromEnv || 'https://job-portals-api.vercel.app/api/v1',
  backendUrl: backendFromEnv || 'https://job-portals-api.vercel.app',
};

let envconfig = local;

if (import.meta.env.MODE === 'staging') {
  envconfig = staging;
} else if (import.meta.env.PROD) {
  envconfig = production;
}

export default envconfig;
