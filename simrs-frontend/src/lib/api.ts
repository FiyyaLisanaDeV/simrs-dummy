export class ApiError extends Error {
  public statusCode: number;
  public endpoint: string;
  public details: any;

  constructor(message: string, statusCode: number, endpoint: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.details = details;
  }
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers = new Headers(init?.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const endpointUrl = typeof input === 'string' ? input : input.toString();
  let response: Response;

  try {
    response = await fetch(input, { ...init, headers });
  } catch (err: any) {
    // Network Error / CORS Error
    console.error(`[API Network Error] ${endpointUrl}`, err);
    throw new ApiError('Gagal terhubung ke server. Periksa koneksi internet atau server.', 0, endpointUrl, err.message);
  }
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Error Manager: Intercept HTTP Errors
  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    let errorDetails = null;
    
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
      errorDetails = errorData;
    } catch (e) {
      // Jika response bukan JSON, ambil raw text
      const text = await response.text();
      errorMsg = text || errorMsg;
    }

    console.error(`[API Error ${response.status}] ${endpointUrl} =>`, errorMsg);
    throw new ApiError(errorMsg, response.status, endpointUrl, errorDetails);
  }
  
  return response;
}
