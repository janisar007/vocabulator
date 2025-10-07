import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle,
  XCircle,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
} from "lucide-react";

const Flashcards = () => {
  const { user, logout } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [todayFlashcard, setTodayFlashcard] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateFlashcard, setShowCreateFlashcard] = useState(false);
  const [newFlashcard, setNewFlashcard] = useState({
    date: "",
    title: "",
  });

  useEffect(() => {
    fetchTodayFlashcards();
    fetchFlashcards();
  }, []);

  const fetchTodayFlashcards = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + "/api/flashcards/today"
      );
      setTodayFlashcard(response.data.data.flashcard);
    } catch (error) {
      console.error("Error fetching today's flashcards:", error);
    }
  };

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);

      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/api/flashcards?${params}`
      );
      setFlashcards(response.data.data.flashcards);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    }
    setLoading(false);
  };

  const clearFilter = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);

      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/api/flashcards`
      );
      setFlashcards(response.data.data.flashcards);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    }
    setLoading(false);
  };

  const markAsCompleted = async (flashcardId) => {
    try {
      await axios.patch(
        import.meta.env.VITE_API_URL + `/api/flashcards/${flashcardId}/complete`
      );
      fetchFlashcards();
      if (todayFlashcard && todayFlashcard._id === flashcardId) {
        fetchTodayFlashcards();
      }
    } catch (error) {
      console.error("Error marking as completed:", error);
    }
  };

  const createFlashcard = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        import.meta.env.VITE_API_URL + "/api/flashcards",
        newFlashcard
      );
      setShowCreateFlashcard(false);
      setNewFlashcard({ date: "", title: "" });
      fetchFlashcards();
    } catch (error) {
      console.error("Error creating flashcard:", error);
    }
  };

  const deleteFlashcard = async (flashcardId) => {
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
      try {
        await axios.delete(
          import.meta.env.VITE_API_URL + `/api/flashcards/${flashcardId}`
        );
        fetchFlashcards();
        if (todayFlashcard && todayFlashcard._id === flashcardId) {
          fetchTodayFlashcards();
        }
      } catch (error) {
        console.error("Error deleting flashcard:", error);
      }
    }
  };

  const removeWordFromFlashcard = async (flashcardId, wordId) => {
    try {
      // Convert flashcard date to the format expected by backend
      const flashcardDate = new Date(flashcardId).toISOString().split("T")[0];

      await axios.delete(`/api/words/${wordId}/flashcards`, {
        data: { date: flashcardDate },
      });
      fetchFlashcards();
      fetchTodayFlashcards();
    } catch (error) {
      console.error("Error removing word from flashcard:", error);
    }
  };

  const nextCard = () => {
    if (todayFlashcard && todayFlashcard.words.length > 0) {
      setCurrentCardIndex((prev) =>
        prev < todayFlashcard.words.length - 1 ? prev + 1 : 0
      );
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (todayFlashcard && todayFlashcard.words.length > 0) {
      setCurrentCardIndex((prev) =>
        prev > 0 ? prev - 1 : todayFlashcard.words.length - 1
      );
      setShowAnswer(false);
    }
  };

  const currentWord = todayFlashcard?.words[currentCardIndex]?.word;
  console.log(todayFlashcard);
  console.log(flashcards);
//   console.log(currentCardIndex);
//   console.log(currentWord);


const setInTodaysFlashCard = (idx) => {

    setTodayFlashcard(flashcards[idx])
    setCurrentCardIndex(0);

}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, <span className='font-semibold'>{user?.name}</span></span>
              <button
                onClick={() => setShowCreateFlashcard(true)}
                className="text-blue-600 border-blue-600 border px-4 py-2 rounded-md cursor-pointer hover:bg-blue-50 flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>New Flashcard</span>
              </button>
              <button
                onClick={logout}
                className="text-red-600 font-semibold px-4 py-2 rounded-md hover:opacity-80 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Today's Flashcard */}
          {todayFlashcard && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Today's Flashcards</h2>
                <div className="flex items-center space-x-2">
                  <Calendar size={20} />
                  <span>
                    {new Date(todayFlashcard.date).toLocaleDateString()}
                  </span>
                  {todayFlashcard.completed && (
                    <CheckCircle className="text-green-500" size={20} />
                  )}
                </div>
              </div>

              {todayFlashcard.words.length > 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
                  {/* Flashcard */}
                  <div className="text-center mb-6">
                    <div className="text-sm text-gray-500 mb-2">
                      Card {currentCardIndex + 1} of{" "}
                      {todayFlashcard.words.length}
                    </div>

                    <div
                      className="bg-blue-50 rounded-lg p-8 cursor-pointer min-h-[200px] flex items-center justify-center border-2 border-blue-200"
                      onClick={() => setShowAnswer(!showAnswer)}
                    >
                      {!showAnswer ? (
                        <div className="text-3xl font-bold text-blue-900">
                          {currentWord?.word}
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-900 mb-4">
                            {currentWord?.word}
                          </div>
                          <div className="text-gray-700 mb-2">
                            {currentWord?.userMeaning || "No meaning added"}
                          </div>
                          {currentWord?.geminiData?.hindiMeaning && (
                            <div className="text-sm text-gray-600 mb-2">
                              Hindi: {currentWord.geminiData.hindiMeaning}
                            </div>
                          )}
                          {currentWord?.details?.actualMeaning && (
                            <div className="text-sm text-gray-600">
                              Meaning: {currentWord.details.actualMeaning}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      Click card to {showAnswer ? "hide" : "show"} answer
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={prevCard}
                      className="bg-gray-300 text-gray-700 border cursor-pointer border-gray-600 px-4 py-2 rounded hover:bg-gray-200"
                    >
                      Previous
                    </button>

                    {!todayFlashcard.completed && (
                      <button
                        onClick={() => markAsCompleted(todayFlashcard._id)}
                        className="text-green-600 border-green-600 border px-4 py-2 rounded hover:bg-opacity-80 hover:bg-green-50 cursor-pointer flex items-center space-x-2"
                      >
                        <CheckCircle size={16} />
                        <span>Mark as Completed</span>
                      </button>
                    )}

                    <button
                      onClick={nextCard}
                      className="bg-gray-300 text-gray-700 border cursor-pointer border-gray-600 px-4 py-2 rounded hover:bg-gray-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <Bookmark className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No flashcards for today
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Add words to flashcards from the dashboard to start
                    learning!
                  </p>
                  <Link
                    to="/dashboard"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Previous Flashcards */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Flashcard History</h2>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <button
                    onClick={fetchFlashcards}
                    className="bg-blue-200 border border-blue-600 cursor-pointer text-medium text-blue-700 px-4 py-2 rounded-md hover:bg-blue-300"
                  >
                    Filter
                  </button>
                 {selectedDate && selectedDate.length > 0 && <button
                    onClick={() => { setSelectedDate(""); clearFilter()}}
                    className=" text-black cursor-pointer hover:bg-gray-100 border border-gray-600 px-4 py-2 rounded-md"
                  >
                    Clear Filter
                  </button>}
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : flashcards.length > 0 ? (
                <div className="space-y-4">
                  {flashcards.map((flashcard, idx) => (
                    <div
                    onClick={() => setInTodaysFlashCard(idx)}
                      key={flashcard?._id}
                      className={`cursor-pointer p-4 border rounded-lg ${
                        flashcard.completed
                          ? "border-green-200 "
                          : "border-gray-200 "
                      }  ${ flashcard?._id == todayFlashcard?._id && "bg-fuchsia-50" }`}
                    >
                      <div className="flex justify-between items-start mb-3 ">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">
                              {flashcard.title ||
                                new Date(flashcard.date).toLocaleDateString()}
                            </span>
                            {flashcard.completed && (
                              <CheckCircle
                                className="text-green-500"
                                size={16}
                              />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {new Date(flashcard.date).toLocaleDateString()} •{" "}
                            {flashcard.words.length} words
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!flashcard.completed && (
                            <button
                              onClick={() => markAsCompleted(flashcard._id)}
                              className="border-green-600 border bg-green-100 text-green-600 px-3 py-1 rounded text-sm hover:bg-green-200 cursor-pointer"
                            >
                              Mark Complete
                            </button>
                          )}
                          <button
                            onClick={() => deleteFlashcard(flashcard._id)}
                            className="text-red-600 px-3 py-1 rounded cursor-pointer text-md hover:text-red-400"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>

                      {flashcard.words.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {flashcard.words.map((item, index) => (
                            <div
                              key={index}
                              className="bg-blue-50 border border-blue-200 rounded p-3 flex justify-between items-center"
                            >
                              <div>
                                <div className="font-medium text-blue-900">
                                  {item.word?.word}{" "}
                                  {/* Now this should show the actual word string */}
                                </div>
                                {item.word?.userMeaning && (
                                  <div className="text-xs text-blue-700 mt-1">
                                    {item.word.userMeaning.substring(0, 50)}...
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  removeWordFromFlashcard(
                                    flashcard.date,
                                    item.word?._id
                                  )
                                }
                                className="text-gray-500 hover:text-gray-700 ml-2"
                                title="Remove from flashcard"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No flashcards found for the selected date.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Flashcard Modal */}
      {showCreateFlashcard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Create New Flashcard</h2>
              <form onSubmit={createFlashcard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFlashcard.date}
                    onChange={(e) =>
                      setNewFlashcard({ ...newFlashcard, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional title for your flashcard"
                    value={newFlashcard.title}
                    onChange={(e) =>
                      setNewFlashcard({
                        ...newFlashcard,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateFlashcard(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Flashcard
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
