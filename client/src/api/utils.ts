export const handleApiError = async (response: Response, defaultMessage: string): Promise<never> => {
  let errorMessage = defaultMessage;
  
  try {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json();
      
      if (error?.message) {
        errorMessage = String(error.message);
      } else if (error?.error) {
        errorMessage = String(error.error);
      }
    } else {
      const text = await response.text();
      if (text) {
        errorMessage = text;
      }
    }
  } catch {
    errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
  }
  throw new Error(errorMessage);
};

