const API_BASE_URL = 'https://excelera-backend.onrender.com/api';

interface ApiConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  isFormData?: boolean; // New flag for form-data uploads
}

export const apiRequest = async <T>(endpoint: string, config: ApiConfig = {}): Promise<T> => {
  const token = localStorage.getItem('token'); // Get token from localStorage
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(config.headers || {}),
  };

  // Add Authorization header if token exists, regardless of isFormData
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type for non-form-data requests
  if (!config.isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const requestOptions: RequestInit = {
    method: config.method || 'GET',
    headers,
    body: config.body,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong with the API request.');
    }

    // Handle 204 No Content for successful deletions or updates without a body
    if (response.status === 204) {
      return {} as T; // Return empty object for no content
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};
