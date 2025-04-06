// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './App.css';

// function App() {
//   const [words, setWords] = useState([]);
//   const [newWord, setNewWord] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchWords();
//   }, []);

//   const fetchWords = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/words');
//       setWords(response.data);
//       setLoading(false);
//     } catch (err) {
//       setError('Failed to fetch words');
//       setLoading(false);
//     }
//   };

//   const handleAddWord = async (e) => {
//     e.preventDefault();
//     if (!newWord.trim()) return;

//     try {
//       const response = await axios.post('http://localhost:5000/api/words', {
//         word: newWord
//       });
//       setWords([response.data, ...words]);
//       setNewWord('');
//     } catch (err) {
//       setError('Failed to add word');
//     }
//   };

//   if (loading) return <div className="loading">Loading...</div>;
//   if (error) return <div className="error">{error}</div>;

//   return (
//     <div className="app">
//       <h1>Programming Languages Display App</h1>
//       <form onSubmit={handleAddWord} className="word-form">
//         <input
//           type="text"
//           value={newWord}
//           onChange={(e) => setNewWord(e.target.value)}
//           placeholder="Enter a new language"
//           required
//         />
//         <button type="submit">Add Word</button>
//       </form>
//       <div className="words-container">
//         <h2>Languages Learnt:</h2>
//         <ul className="words-list">
//           {words.map((word) => (
//             <li key={word.id} className="word-item">
//               {word.word}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Create new AbortController for each request
    abortControllerRef.current = new AbortController();
    
    const fetchWords = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:5000/api/words', {
          signal: abortControllerRef.current.signal
        });
        setWords(response.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError('Failed to fetch languages. Please try again.');
          console.error('Fetch error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWords();

    // Cleanup function to cancel pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleAddWord = async (e) => {
    e.preventDefault();
    const trimmedWord = newWord.trim();
    if (!trimmedWord) return;

    try {
      setError(null);
      setSuccess(null);
      const response = await axios.post('http://localhost:5000/api/words', {
        word: trimmedWord
      }, {
        signal: abortControllerRef.current?.signal
      });
      
      setWords([response.data, ...words]);
      setNewWord('');
      setSuccess(`${trimmedWord} added successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.response?.data?.error || 'Failed to add language');
        console.error('Add word error:', err);
      }
    }
  };

  return (
    <div className="app">
      <h1>Programming Languages Display App</h1>
      
      {/* Success message */}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleAddWord} className="word-form">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Enter a new language"
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newWord.trim()}>
          {loading ? 'Adding...' : 'Add Language'}
        </button>
      </form>
      
      <div className="words-container">
        <h2>Languages Learnt:</h2>
        
        {/* Loading and error states */}
        {loading && !words.length ? (
          <div className="loading">Loading languages...</div>
        ) : error ? (
          <div className="error">
            {error}
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry
            </button>
          </div>
        ) : (
          <ul className="words-list">
            {words.length > 0 ? (
              words.map((word) => (
                <li key={word.id} className="word-item">
                  {word.word}
                  <span className="word-date">
                    {new Date(word.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))
            ) : (
              <li className="no-items">No languages added yet</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;