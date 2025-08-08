
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { DataDisplay } from './components/DataDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { WelcomeMessage } from './components/WelcomeMessage';
import type { PassportData } from './types';
import { extractPassportData } from './services/geminiService';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [passportData, setPassportData] = useState<PassportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    setPassportData(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClear = useCallback(() => {
    setImageFile(null);
    setPassportData(null);
    setError(null);
    setImagePreviewUrl(null);
  }, []);

  const handleExtractData = useCallback(async () => {
    if (!imageFile) {
      setError("Please upload an image first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPassportData(null);

    try {
      const data = await extractPassportData(imageFile);
      setPassportData(data);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to extract data. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  return (
    <div className="min-h-screen bg-base-100 text-text-primary font-sans">
      <Header />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        <div className="bg-base-200 shadow-2xl rounded-2xl p-6 md:p-8">
          <ImageUploader
            onImageUpload={handleImageUpload}
            onClear={handleClear}
            imagePreviewUrl={imagePreviewUrl}
            isProcessing={isLoading}
          />

          {imageFile && !isLoading && !passportData && (
            <div className="mt-6 text-center">
              <button
                onClick={handleExtractData}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500/50 disabled:bg-base-300 disabled:cursor-not-allowed"
              >
                Extract Data
              </button>
            </div>
          )}

          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          
          {!imageFile && !isLoading && !error && <WelcomeMessage />}
          
          {passportData && !isLoading && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-brand-secondary">Extracted Information</h2>
              <DataDisplay data={passportData} />
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-4 mt-8 text-sm text-text-secondary">
        <p>Passport Data Extractor &copy; 2024. For demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
