import { useState, ChangeEvent, useRef } from "react";
import { Play, Pause, StopCircle, XCircle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

const TextToSpeech: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileRef = useRef(null);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutDuration = 10000; // 10 seconds timeout for fetching content

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError("");

      const fileType = file.type;
      if (fileType === "application/pdf") {
        handlePdfUpload(file);
      } else if (
        fileType === "application/msword" ||
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        handleDocxUpload(file);
      } else {
        alert("Please upload a valid PDF or Word document.");
        setIsLoading(false);
      }
    }
  };

  const handlePdfUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result;
      if (!arrayBuffer) return;

      const loadingTask = pdfjsLib.getDocument(arrayBuffer as ArrayBuffer);
      loadingTask.promise
        .then((pdf) => {
          let textContent = "";
          const promises = Array.from({ length: pdf.numPages }, (_, i) =>
            pdf.getPage(i + 1).then((page) =>
              page.getTextContent().then((text) => {
                textContent += text.items
                  .map((item: any) => item.str)
                  .join(" ");
              })
            )
          );

          Promise.all(promises).then(() => {
            setFileContent(textContent);
            setIsLoading(false);
          });
        })
        .catch(() => {
          setError("Failed to fetch file content. Please try again.");
          setIsLoading(false);
        });
    };
    reader.readAsArrayBuffer(file);

    setTimeout(() => {
      if (isLoading) {
        setError("Fetching file content timed out.");
        setIsLoading(false);
      }
    }, timeoutDuration);
  };

  const handleDocxUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result;
      if (!arrayBuffer) return;

      mammoth
        .extractRawText({ arrayBuffer: arrayBuffer as ArrayBuffer })
        .then((result) => {
          setFileContent(result.value);
          setIsLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch file content. Please try again.");
          setIsLoading(false);
        });
    };
    reader.readAsArrayBuffer(file);

    setTimeout(() => {
      if (isLoading) {
        setError("Fetching file content timed out.");
        setIsLoading(false);
      }
    }, timeoutDuration);
  };

  const startSpeech = () => {
    if (synth?.speaking) {
      alert("Already speaking. Please stop first.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(fileContent);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pauseSpeech = () => {
    if (synth?.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const resumeSpeech = () => {
    if (synth?.paused) {
      synth.resume();
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const stopSpeech = () => {
    if (synth?.speaking) {
      synth.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const removeFile = () => {
    setFileContent("");
    setIsPlaying(false);
    setError("");
    synth.cancel();

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto p-8">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Text to Speech
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Upload a Word or PDF document, preview its content, and convert it to
          speech.
        </p>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Upload File <span className="text-red-500">*</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf, .doc, .docx"
            onChange={handleFileUpload}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {isLoading && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Fetching file content...</p>
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        {fileContent && !isLoading && !error && (
          <section className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              File Preview
            </h3>
            <div className="overflow-y-auto max-h-80 border p-3 rounded-lg text-gray-800">
              {fileContent}
            </div>
            <button
              onClick={removeFile}
              className="flex items-center text-red-500 hover:text-red-700 mt-2"
            >
              <XCircle size={20} className="mr-2" />
              Remove File
            </button>
          </section>
        )}

        {fileContent && (
          <div className="flex items-center justify-center space-x-4 mt-4">
            <button
              onClick={startSpeech}
              className={`flex items-center px-4 py-2 rounded-lg text-white ${
                isPlaying || isPaused
                  ? "bg-gray-300"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={isPlaying || isPaused || !fileContent}
            >
              <Play size={20} className="mr-1" />
              Play
            </button>
            <button
              onClick={pauseSpeech}
              className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
              disabled={!isPlaying || isPaused}
            >
              <Pause size={20} className="mr-1" />
              Pause
            </button>
            <button
              onClick={resumeSpeech}
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              disabled={!isPaused}
            >
              Resume
            </button>
            <button
              onClick={stopSpeech}
              className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              disabled={!isPlaying && !isPaused}
            >
              <StopCircle size={20} className="mr-1" />
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextToSpeech;
