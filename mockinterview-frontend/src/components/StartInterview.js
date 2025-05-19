import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startInterview } from '../store/slices/interviewSlice';
import colors from '../theme/colors';

function StartInterview({ onInterviewStart }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.interview);
  
  const [interviewType, setInterviewType] = useState('mixed');
  const [numQuestions, setNumQuestions] = useState(5);
  
  const handleStartInterview = async () => {
    const result = await dispatch(startInterview({
      interviewType,
      numQuestions
    }));
    
    if (!result.error) {
      onInterviewStart();
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg shadow-md" 
         style={{ backgroundColor: colors.softWhite }}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal }}>
        Start a New Interview
      </h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
          Interview Type
        </label>
        <select
          value={interviewType}
          onChange={(e) => setInterviewType(e.target.value)}
          className="w-full p-2 border rounded-md"
          style={{ borderColor: colors.sage }}
        >
          <option value="technical">Technical</option>
          <option value="behavioral">Behavioral</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
          Number of Questions
        </label>
        <select
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          className="w-full p-2 border rounded-md"
          style={{ borderColor: colors.sage }}
        >
          <option value={3}>3 Questions</option>
          <option value={5}>5 Questions</option>
          <option value={10}>10 Questions</option>
        </select>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <button
        onClick={handleStartInterview}
        disabled={loading}
        className="w-full py-2 px-4 rounded-md font-medium transition-colors"
        style={{ 
          backgroundColor: loading ? '#e2e8f0' : colors.accent,
          color: 'white',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Starting...' : 'Start Interview'}
      </button>
    </div>
  );
}

export default StartInterview;