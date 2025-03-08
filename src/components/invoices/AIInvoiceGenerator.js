'use client';

import { useState } from 'react';

export default function AIInvoiceGenerator({ onGenerate, onCancel }) {
  const [clientDescription, setClientDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [examples] = useState([
    "Website design for ABC Company, including 5 pages, logo design, and mobile optimization.",
    "Monthly social media management for XYZ Inc, including content creation for Instagram, Facebook, and Twitter.",
    "Consulting services for Johnson LLC, 10 hours at $150/hour, focusing on business strategy and market analysis."
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clientDescription.trim()) {
      setError('Please provide a description of your work and client');
      return;
    }
    
    try {
      setGenerating(true);
      setError(null);
      
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientDescription }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }
      
      const data = await response.json();
      onGenerate(data.invoice);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExampleClick = (example) => {
    setClientDescription(example);
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Generate Invoice with AI</h2>
      <p className="text-gray-600 mb-4">
        Describe your client and the work you've done, and our AI will generate an invoice for you.
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="clientDescription" className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            id="clientDescription"
            value={clientDescription}
            onChange={(e) => setClientDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="E.g., Website design for ABC Company, including 5 pages, logo design, and mobile optimization."
            required
          ></textarea>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Examples (click to use):</p>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="text-sm text-left text-blue-600 hover:text-blue-800 hover:underline block w-full truncate"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={generating}
            className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ${
              generating ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {generating ? 'Generating...' : 'Generate Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
