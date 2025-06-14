import { useState } from 'react';
import axios from 'axios';

function TestGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testSimpleEndpoint = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log('Testing simple Gemini endpoint...');
      const result = await axios.post('http://localhost:5000/api/quiz/test-gemini', {});
      console.log('Received response:', result.data);
      setResponse(result.data);
    } catch (err) {
      console.error('Error testing Gemini:', err);
      setError(err.message || 'Failed to test Gemini API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Gemini API Test</h1>
      
      <div className="mb-4">
        <button
          onClick={testSimpleEndpoint}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Testing...' : 'Test Gemini API'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {response && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">Response</p>
          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default TestGemini; 