import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import Spinner from "react-bootstrap/Spinner";
import "./App.css";

const App = () => {
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setRecording] = useState(false);
  const [limit, setLimit] = useState(1);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false); // Flag to prevent multiple recognition attempts

  const startListening = () => {
    if (!isRecognizing) {
      setIsRecognizing(true);
      SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
      setRecording(true);
      setError("");
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setRecording(false);
    setIsRecognizing(false);
  };

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const reset = () => {
    SpeechRecognition.abortListening();
    setRecording(false);
    setData([]);
    setCurrentTranscript("");
    setIsRecognizing(false);
    resetTranscript();
    setError("");
  };

  useEffect(() => {
    if (transcript !== currentTranscript) {
      setCurrentTranscript(transcript);
    }
  }, [transcript, currentTranscript]);

  const getImage = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await fetch("http://localhost:3001/generate_images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: currentTranscript, limit }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonData = await response.json();
      setData(jsonData.images);
      setLoading(false);
    } catch (error) {
      setError("An error occurred while processing the request.");
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Voice-Over Image Generator</h2>
      <p className="text-center mb-4">
        A React hook that converts speech from the microphone to text and makes
        it available to your React components.
      </p>

      <div className="main-content bg-light p-4 mb-4">{currentTranscript}</div>

      <div className="controls d-flex justify-content-center align-items-center mb-4">
        <button
          className={`btn ${isRecording ? "btn-danger" : "btn-primary"} mr-2`}
          onClick={isRecording ? stopListening : startListening}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        <button className="btn btn-secondary mr-2" onClick={reset}>
          Reset
        </button>
        <div className="input-box">
          <label htmlFor="limit" className="mr-2">
            Limit:
          </label>
          <input
            id="limit"
            type="number"
            className="form-control mr-2"
            placeholder="Limit"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            disabled={!browserSupportsSpeechRecognition}
          />
        </div>
        <button
          className="btn btn-success"
          onClick={getImage}
          disabled={
            !browserSupportsSpeechRecognition ||
            isLoading ||
            isRecording ||
            currentTranscript.length === 0
          }
        >
          {isLoading ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : (
            "Convert To Image"
          )}
        </button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      {data.length > 0 && (
        <>
          <p className="text-center mb-4">Images Output list</p>
          <div className="image-gallery">
            {data.map((imageData, index) => (
              <div key={index} className="image-item">
                <p className="image-number">{index + 1}</p>
                <img
                  src={`data:image/jpeg;base64,${imageData.data}`}
                  alt={imageData.filename}
                  className="img-fluid"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
