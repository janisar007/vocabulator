import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Filter, 
  LogOut, 
  Bookmark,
  Loader,
  Trash2,
  Edit3,
  Save,
  X,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newWord, setNewWord] = useState({
    word: '',
    userMeaning: '',
    synonyms: [{ word: '', meaning: '' }],
    antonyms: [{ word: '', meaning: '' }],
    details: {
      actualMeaning: '',
      sentences: [''],
      oneWordSubstitutes: ['']
    }
  });

  useEffect(() => {
    fetchWords();
  }, [currentPage, searchTerm, selectedDate]);

  const showMessage = (message, type = 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const fetchWords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedDate && { date: selectedDate })
      });

      const response = await axios.get(import.meta.env.VITE_API_URL + `/api/words?${params}`);
      setWords(response.data.data.words);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching words:', error);
    }
    setLoading(false);
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/words', newWord);
      setShowAddWord(false);
      setNewWord({
        word: '',
        userMeaning: '',
        synonyms: [{ word: '', meaning: '' }],
        antonyms: [{ word: '', meaning: '' }],
        details: {
          actualMeaning: '',
          sentences: [''],
          oneWordSubstitutes: ['']
        }
      });
      fetchWords();
      showMessage('Word added successfully!', 'success');
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding word');
    }
  };

  const handleEditWord = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.patch(import.meta.env.VITE_API_URL + `/api/words/${editingWord._id}`, editingWord);
      setEditingWord(null);
      fetchWords();
      showMessage('Word updated successfully!', 'success');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating word');
    }
  };

  const handleDeleteWord = async (wordId) => {
    if (window.confirm('Are you sure you want to delete this word?')) {
      try {
        await axios.delete(import.meta.env.VITE_API_URL + `/api/words/${wordId}`);
        fetchWords();
        showMessage('Word deleted successfully!', 'success');
      } catch (error) {
        setError('Error deleting word');
      }
    }
  };

  const handleQuickAdd = async (word) => {
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/words', { word });
      fetchWords();
      showMessage(`Word "${word}" added successfully!`, 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error adding word';
      showMessage(errorMessage);
    }
  };

  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiWordId, setGeminiWordId] = useState("");

  const handleGeminiFetch = async (wordId) => {
    setGeminiLoading(true)
    setGeminiWordId(wordId)
    try {
      await axios.post(import.meta.env.VITE_API_URL + `/api/words/${wordId}/gemini`);
      fetchWords();
      showMessage('Gemini data fetched successfully!', 'success');
    } catch (error) {
      console.error('Error fetching Gemini data:', error);
    } finally {
        setGeminiLoading(false)
    }
  };

  const addToFlashcard = async (wordId, date = null) => {
    try {
      const requestData = date ? { date } : {};
      await axios.post(import.meta.env.VITE_API_URL + `/api/words/${wordId}/flashcards`, requestData);
      showMessage('Word added to flashcard!', 'success');
      // Refresh words to update flashcard status
      fetchWords();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Error adding to flashcard');
    }
  };

  const removeFromFlashcard = async (wordId, date = null) => {
    try {
      const requestData = date ? { date } : {};
      await axios.delete(import.meta.env.VITE_API_URL + `/api/words/${wordId}/flashcards`, { data: requestData });
      showMessage('Word removed from flashcard!', 'success');
      // Refresh words to update flashcard status
      fetchWords();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Error removing from flashcard');
    }
  };

  const startEditing = (word) => {
    setEditingWord(JSON.parse(JSON.stringify(word)));
  };

  const cancelEditing = () => {
    setEditingWord(null);
  };

  // Helper functions for dynamic arrays (same as before)
  const addSynonym = (isEditing = false) => {
    if (isEditing) {
      setEditingWord({
        ...editingWord,
        synonyms: [...editingWord.synonyms, { word: '', meaning: '' }]
      });
    } else {
      setNewWord({
        ...newWord,
        synonyms: [...newWord.synonyms, { word: '', meaning: '' }]
      });
    }
  };

  const removeSynonym = (index, isEditing = false) => {
    if (isEditing) {
      const newSynonyms = [...editingWord.synonyms];
      newSynonyms.splice(index, 1);
      setEditingWord({
        ...editingWord,
        synonyms: newSynonyms
      });
    } else {
      const newSynonyms = [...newWord.synonyms];
      newSynonyms.splice(index, 1);
      setNewWord({
        ...newWord,
        synonyms: newSynonyms
      });
    }
  };

  const addAntonym = (isEditing = false) => {
    if (isEditing) {
      setEditingWord({
        ...editingWord,
        antonyms: [...editingWord.antonyms, { word: '', meaning: '' }]
      });
    } else {
      setNewWord({
        ...newWord,
        antonyms: [...newWord.antonyms, { word: '', meaning: '' }]
      });
    }
  };

  const removeAntonym = (index, isEditing = false) => {
    if (isEditing) {
      const newAntonyms = [...editingWord.antonyms];
      newAntonyms.splice(index, 1);
      setEditingWord({
        ...editingWord,
        antonyms: newAntonyms
      });
    } else {
      const newAntonyms = [...newWord.antonyms];
      newAntonyms.splice(index, 1);
      setNewWord({
        ...newWord,
        antonyms: newAntonyms
      });
    }
  };

  const addSentence = (isEditing = false) => {
    if (isEditing) {
      setEditingWord({
        ...editingWord,
        details: {
          ...editingWord.details,
          sentences: [...editingWord.details.sentences, '']
        }
      });
    } else {
      setNewWord({
        ...newWord,
        details: {
          ...newWord.details,
          sentences: [...newWord.details.sentences, '']
        }
      });
    }
  };

  const removeSentence = (index, isEditing = false) => {
    if (isEditing) {
      const newSentences = [...editingWord.details.sentences];
      newSentences.splice(index, 1);
      setEditingWord({
        ...editingWord,
        details: {
          ...editingWord.details,
          sentences: newSentences
        }
      });
    } else {
      const newSentences = [...newWord.details.sentences];
      newSentences.splice(index, 1);
      setNewWord({
        ...newWord,
        details: {
          ...newWord.details,
          sentences: newSentences
        }
      });
    }
  };

  const addOneWordSubstitute = (isEditing = false) => {
    if (isEditing) {
      setEditingWord({
        ...editingWord,
        details: {
          ...editingWord.details,
          oneWordSubstitutes: [...editingWord.details.oneWordSubstitutes, '']
        }
      });
    } else {
      setNewWord({
        ...newWord,
        details: {
          ...newWord.details,
          oneWordSubstitutes: [...newWord.details.oneWordSubstitutes, '']
        }
      });
    }
  };

  const removeOneWordSubstitute = (index, isEditing = false) => {
    if (isEditing) {
      const newSubstitutes = [...editingWord.details.oneWordSubstitutes];
      newSubstitutes.splice(index, 1);
      setEditingWord({
        ...editingWord,
        details: {
          ...editingWord.details,
          oneWordSubstitutes: newSubstitutes
        }
      });
    } else {
      const newSubstitutes = [...newWord.details.oneWordSubstitutes];
      newSubstitutes.splice(index, 1);
      setNewWord({
        ...newWord,
        details: {
          ...newWord.details,
          oneWordSubstitutes: newSubstitutes
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">VOCABULATOR</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <Link
                to="/flashcards"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <Bookmark size={16} />
                <span>Flashcards</span>
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Add and Search */}
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {/* {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )} */}

          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search words... (e.g., acc for accord, account, etc.)"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button
                onClick={() => setShowAddWord(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Word</span>
              </button>
            </div>
          </div>

          {/* Quick Add Words */}
          {/* <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-3">Quick Add Common SSC Words</h3>
            <div className="flex flex-wrap gap-2">
              {['Abate', 'Accord', 'Benevolent', 'Candid', 'Diligent', 'Eloquent', 'Frugal', 'Gregarious'].map((word) => (
                <button
                  key={word}
                  onClick={() => handleQuickAdd(word)}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
                >
                  {word}
                </button>
              ))}
            </div>
          </div> */}

          {/* Words Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {false ? (
              <div className="flex justify-center items-center p-8">
                <Loader className="animate-spin" size={32} />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Word & Meaning
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Synonyms & Antonyms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {words.map((word) => (
                    <WordRow 
                      key={word._id} 
                      word={word} 
                      onGeminiFetch={handleGeminiFetch}
                      geminiWordId={geminiWordId}
                      geminiLoading={geminiLoading}
                      onAddToFlashcard={addToFlashcard}
                      onRemoveFromFlashcard={removeFromFlashcard}
                      onEdit={startEditing}
                      onDelete={handleDeleteWord}
                      isEditing={editingWord && editingWord._id === word._id}
                    />
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex justify-between sm:justify-end space-x-2 w-full">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 mx-4">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                    disabled={currentPage === pagination.pages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Word Modal */}
      {showAddWord && (
        <WordModal
          word={newWord}
          setWord={setNewWord}
          onSubmit={handleAddWord}
          onClose={() => setShowAddWord(false)}
          title="Add New Word"
          error={error}
          addSynonym={() => addSynonym(false)}
          removeSynonym={removeSynonym}
          addAntonym={() => addAntonym(false)}
          removeAntonym={removeAntonym}
          addSentence={() => addSentence(false)}
          removeSentence={removeSentence}
          addOneWordSubstitute={() => addOneWordSubstitute(false)}
          removeOneWordSubstitute={removeOneWordSubstitute}
        />
      )}

      {/* Edit Word Modal */}
      {editingWord && (
        <WordModal
          word={editingWord}
          setWord={setEditingWord}
          onSubmit={handleEditWord}
          onClose={cancelEditing}
          title="Edit Word"
          error={error}
          addSynonym={() => addSynonym(true)}
          removeSynonym={(index) => removeSynonym(index, true)}
          addAntonym={() => addAntonym(true)}
          removeAntonym={(index) => removeAntonym(index, true)}
          addSentence={() => addSentence(true)}
          removeSentence={(index) => removeSentence(index, true)}
          addOneWordSubstitute={() => addOneWordSubstitute(true)}
          removeOneWordSubstitute={(index) => removeOneWordSubstitute(index, true)}
        />
      )}
    </div>
  );
};

const WordRow = ({ 
  word, 
  geminiLoading, 
  geminiWordId, 
  onGeminiFetch, 
  onAddToFlashcard, 
  onRemoveFromFlashcard, 
  onEdit, 
  onDelete, 
  isEditing 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFlashcardOptions, setShowFlashcardOptions] = useState(false);
  const [customDate, setCustomDate] = useState('');

  const handleAddToTodayFlashcard = () => {
    onAddToFlashcard(word._id);
    setShowFlashcardOptions(false);
  };

  const handleAddToCustomDate = () => {
    if (customDate) {
      onAddToFlashcard(word._id, customDate);
      setCustomDate('');
      setShowFlashcardOptions(false);
    }
  };

  if (isEditing) {
    return (
      <tr className="bg-yellow-50">
        <td colSpan="4" className="px-6 py-4">
          <div className="text-center text-yellow-700">
            <Loader className="animate-spin inline mr-2" size={16} />
            Editing mode active - Use the edit modal above
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      {/* Column 1: Word & Meaning */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div 
          className="has-tooltip relative"
          
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-900" onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>{word.word}</span>
            
            {/* Flashcard Button */}
            <div className="relative">
              <button
                onClick={() => setShowFlashcardOptions(!showFlashcardOptions)}
                className="p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                title="Add to Flashcard"
              >
                <Bookmark size={16} />
              </button>

              {/* Flashcard Options Dropdown */}
              {showFlashcardOptions && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-3">
                    <h4 className="font-semibold text-sm mb-2">Add to Flashcard</h4>
                    
                    <button
                      onClick={handleAddToTodayFlashcard}
                      className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded mb-2 flex items-center"
                    >
                      <Calendar size={14} className="mr-2" />
                      Add to Today's Flashcards
                    </button>

                    <div className="border-t pt-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Or add to specific date:
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                        />
                        <button
                          onClick={handleAddToCustomDate}
                          disabled={!customDate}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {isHovered && (
            <div className="hover-tooltip w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
              <div className="font-semibold mb-1">Your Understanding:</div>
              <div>{word.userMeaning || 'No meaning added yet'}</div>
            </div>
          )}
        </div>
      </td>

      {/* Column 2: Synonyms & Antonyms */}
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-green-600">Synonyms:</span>
            <div className="mt-1 space-y-1">
              {word.synonyms && word.synonyms.map((syn, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <span className="font-medium">{syn.word}</span>
                  {syn.meaning && (
                    <span className="text-gray-500 text-xs">({syn.meaning})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-red-600">Antonyms:</span>
            <div className="mt-1 space-y-1">
              {word.antonyms && word.antonyms.map((ant, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <span className="font-medium">{ant.word}</span>
                  {ant.meaning && (
                    <span className="text-gray-500 text-xs">({ant.meaning})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </td>

      {/* Column 3: Details */}
      <td className="px-6 py-4">
        <div className="space-y-2 text-sm">
          {word.details?.actualMeaning && (
            <div>
              <span className="font-medium">Meaning:</span> {word.details.actualMeaning}
            </div>
          )}
          {word.details?.sentences && word.details.sentences.length > 0 && (
            <div>
              <span className="font-medium">Sentences:</span>
              <ul className="list-disc list-inside ml-2">
                {word.details.sentences.map((sentence, index) => (
                  <li key={index}>{sentence}</li>
                ))}
              </ul>
            </div>
          )}
          {word.details?.oneWordSubstitutes && word.details.oneWordSubstitutes.length > 0 && (
            <div>
              <span className="font-medium">One-word substitutes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {word.details.oneWordSubstitutes.map((substitute, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {substitute}
                  </span>
                ))}
              </div>
            </div>
          )}
          {word.geminiData && (
            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
              <div className="font-medium text-green-800">Gemini Data:</div>
              <div className="text-xs text-green-700">
                <div>Hindi: {word.geminiData.hindiMeaning}</div>
                <div className="mt-1">Tips: {word.geminiData.learningTips}</div>
              </div>
            </div>
          )}
        </div>
      </td>

      {/* Column 4: Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          {!word.geminiData?.fetchedAt && (
            <button
              onClick={() => onGeminiFetch(word._id)}
              className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700"
              disabled={geminiLoading}
            >

                {
                    geminiWordId == word._id ? "Loading..." : "AI meaning"
                }
              
            </button>
          )}
          <button 
            onClick={() => onEdit(word)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
          >
            <Edit3 size={12} />
          </button>
          <button 
            onClick={() => onDelete(word._id)}
            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// WordModal component remains the same as previous implementation
const WordModal = ({ 
  word, 
  setWord, 
  onSubmit, 
  onClose, 
  title, 
  error,
  addSynonym,
  removeSynonym,
  addAntonym,
  removeAntonym,
  addSentence,
  removeSentence,
  addOneWordSubstitute,
  removeOneWordSubstitute
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Word *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={word.word}
                onChange={(e) => setWord({ ...word, word: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Your Understanding</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="2"
                value={word.userMeaning}
                onChange={(e) => setWord({ ...word, userMeaning: e.target.value })}
              />
            </div>

            {/* Synonyms */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Synonyms</label>
                <button type="button" onClick={addSynonym} className="text-blue-600 text-sm flex items-center">
                  <Plus size={16} className="mr-1" />
                  Add Synonym
                </button>
              </div>
              {word.synonyms.map((synonym, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Synonym word"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={synonym.word}
                    onChange={(e) => {
                      const newSynonyms = [...word.synonyms];
                      newSynonyms[index].word = e.target.value;
                      setWord({ ...word, synonyms: newSynonyms });
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Meaning"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={synonym.meaning}
                    onChange={(e) => {
                      const newSynonyms = [...word.synonyms];
                      newSynonyms[index].meaning = e.target.value;
                      setWord({ ...word, synonyms: newSynonyms });
                    }}
                  />
                  {word.synonyms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSynonym(index)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Antonyms */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Antonyms</label>
                <button type="button" onClick={addAntonym} className="text-blue-600 text-sm flex items-center">
                  <Plus size={16} className="mr-1" />
                  Add Antonym
                </button>
              </div>
              {word.antonyms.map((antonym, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Antonym word"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={antonym.word}
                    onChange={(e) => {
                      const newAntonyms = [...word.antonyms];
                      newAntonyms[index].word = e.target.value;
                      setWord({ ...word, antonyms: newAntonyms });
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Meaning"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={antonym.meaning}
                    onChange={(e) => {
                      const newAntonyms = [...word.antonyms];
                      newAntonyms[index].meaning = e.target.value;
                      setWord({ ...word, antonyms: newAntonyms });
                    }}
                  />
                  {word.antonyms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAntonym(index)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Actual Meaning</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="2"
                value={word.details.actualMeaning}
                onChange={(e) => setWord({
                  ...word,
                  details: { ...word.details, actualMeaning: e.target.value }
                })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Usage Sentences</label>
                <button type="button" onClick={addSentence} className="text-blue-600 text-sm flex items-center">
                  <Plus size={16} className="mr-1" />
                  Add Sentence
                </button>
              </div>
              {word.details.sentences.map((sentence, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder={`Sentence ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={sentence}
                    onChange={(e) => {
                      const newSentences = [...word.details.sentences];
                      newSentences[index] = e.target.value;
                      setWord({
                        ...word,
                        details: { ...word.details, sentences: newSentences }
                      });
                    }}
                  />
                  {word.details.sentences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSentence(index)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">One Word Substitutes</label>
                <button type="button" onClick={addOneWordSubstitute} className="text-blue-600 text-sm flex items-center">
                  <Plus size={16} className="mr-1" />
                  Add Substitute
                </button>
              </div>
              {word.details.oneWordSubstitutes.map((substitute, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder={`One word substitute ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={substitute}
                    onChange={(e) => {
                      const newSubstitutes = [...word.details.oneWordSubstitutes];
                      newSubstitutes[index] = e.target.value;
                      setWord({
                        ...word,
                        details: { ...word.details, oneWordSubstitutes: newSubstitutes }
                      });
                    }}
                  />
                  {word.details.oneWordSubstitutes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOneWordSubstitute(index)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{title.includes('Add') ? 'Add Word' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;