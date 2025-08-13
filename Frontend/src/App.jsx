import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

function App() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'audio/*': [] },
    onDrop: (acceptedFiles) => {
      const selected = acceptedFiles[0];
      setFile(selected);
      setPrediction(null);
      setAudioURL(URL.createObjectURL(selected));
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/predict', formData);
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
      alert("Prediction failed. Make sure the backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-gray-800 shadow-xl rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">
          🔊 ESC-50 Audio Classifier
        </h1>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition duration-300 ${
            isDragActive
              ? 'border-blue-400 bg-gray-700'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-300">
            {file
              ? `Selected: ${file.name}`
              : '🎵 Drag and drop an audio file here, or click to select'}
          </p>
        </div>

        {audioURL && (
          <audio
            className="mt-4 w-full rounded"
            src={audioURL}
            controls
          />
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Predicting...</span>
            </div>
          ) : (
            'Predict'
          )}
        </button>

        {prediction && (
          <div className="mt-6 p-4 bg-blue-900 border border-blue-700 rounded-lg text-center shadow">
            <h2 className="text-xl font-semibold text-blue-300">Prediction</h2>
            <p className="text-lg text-white mt-2">{prediction.label}</p>
            <p className="text-sm text-blue-200">
              Confidence: {(prediction.confidence * 100).toFixed(2)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
