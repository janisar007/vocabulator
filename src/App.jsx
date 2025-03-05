// src/App.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { ClimbingBoxLoader } from 'react-spinners';

function App() {
  const [emailList, setEmailList] = useState('');
  const [subject, setSubject] = useState('');
  const [yourEmail, setYourEmail] = useState("");
  const [mailBorder, setMailBorder] = useState(false);
  const [yourMailMsg, setYourMailMsg] = useState("");
  const [inputValue, setInputValue] = useState("");

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    
    event.preventDefault();

    if(!yourEmail) {
      setYourMailMsg('First set you email');
      setMailBorder(true)
      return;

    }

    if (!emailList || !subject || !message) {
      setStatusMessage('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('emailList', emailList.split(',').map(email => email.trim())); // Split by commas and trim
    formData.append('subject', subject);
    formData.append('message', message);
    formData.append('yourEmail', yourEmail);
    if (pdfFile) {
      formData.append('pdfFile', pdfFile);
    }

    try {
      const response = await axios.post('https://email-api-silk.vercel.app/send-emails', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatusMessage(response.data.message || 'Emails sent successfully!');
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setStatusMessage('Failed to send emails. Please try again.');
      console.error('Error:', error);
    }
  };

  const handleSetEmail = () => {
    setMailBorder(false)
    setYourEmail(inputValue);
  };

  return (
    <div className='flex flex-col items-center p-4'>
      <div className='flex gap-6 bg-amber-100 w-full items-center justify-center p-2'>

        <div className='text-4xl font-semibold text-blue-700'>REFMAILER</div>
        <div className='flex gap-1 justify-end'>
          <span>by</span>
          <span className='text-6xl text-green-600'>Janisar</span>
        </div>
      </div>


    <div className='flex items-center flex-col sm:flex-row'>


      <div className='flex flex-col gap-8 '>
        

        <div className='text-4xl text-red-600'>
          {mailBorder && yourMailMsg}
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <label className="block mb-2">
            Your Email : 
            <input
              value={inputValue}
              onChange={(e) => {setMailBorder(false); setInputValue(e.target.value)}}
              className={`w-full p-2 border ${mailBorder ? "border-red-600" : ""} rounded mb-4`}
              placeholder="example2@example.com"
            />
          </label>
          <button
            type="button"
            onClick={handleSetEmail}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Set Your Email
          </button>
          <p className="mt-4 font-semibold">Saved Email: {yourEmail}</p>
        </form>



      </div>

      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Send Referral Emails</h1>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Email List (comma-separated):
            <textarea
              value={emailList}

              onChange={(e) => setEmailList(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              rows="3"
              placeholder="example1@example.com, example2@example.com"
            />
          </label>
          <label className="block mb-2">
            Subject:
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter email subject"
            />
          </label>
          <label className="block mb-2">
            Message:
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              rows="5"
              placeholder="Enter your message here"
            />
          </label>
          <label className="block mb-4">
            Attach PDF (optional):
          <input className='border p-3 rounded-md cursor-pointer font-semibold' type="file" onChange={handleFileChange} />
          </label>
          {!loading && <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Send Emails
          </button>}
        </form>
        {loading ? <span className='flex items-center' ><p>Sabar karo thoda...</p> <span className='text-white'><ClimbingBoxLoader /> </span></span> : (statusMessage && (
          <p className="mt-4 text-sm text-gray-700">{statusMessage}</p>)
        )}
      </div>

    </div>
    </div>
  );
}

export default App;
