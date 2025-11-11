'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { encryptFile } from '@/lib/client-encryption';

interface Step {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'MULTIPLE_CHOICE' | 'FILE_UPLOAD' | 'COMBINED';
  options?: string[];
  required: boolean;
}

interface SimulationPlayerProps {
  simulation: {
    id: string;
    title: string;
    description: string;
    sector: string;
    difficulty: string;
    estimatedDuration: number;
    steps: any;
    rubric: any;
    resources: any;
  };
  attemptId: string;
  userId: string;
}

interface Response {
  stepId: string;
  textResponse?: string;
  selectedOption?: number;
  mediaKeys?: string[];
}

export default function SimulationPlayer({
  simulation,
  attemptId,
  userId,
}: SimulationPlayerProps) {
  const router = useRouter();
  const steps = simulation.steps as Step[];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentResponse, setCurrentResponse] = useState<Response>({
    stepId: steps[0]?.id,
  });
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const currentStep = steps[currentStepIndex];

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => clearInterval(interval);
  }, [responses, currentStepIndex]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Save progress to backend
  const saveProgress = async () => {
    try {
      await fetch('/api/attempts/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          responses,
          currentStep: currentStepIndex,
          timeSpent: elapsedTime,
        }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Handle text response
  const handleTextChange = (value: string) => {
    setCurrentResponse({
      ...currentResponse,
      textResponse: value,
      stepId: currentStep.id,
    });
    setError('');
  };

  // Handle multiple choice selection
  const handleOptionSelect = (optionIndex: number) => {
    setCurrentResponse({
      ...currentResponse,
      selectedOption: optionIndex,
      stepId: currentStep.id,
    });
    setError('');
  };

  // Handle file upload with encryption
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadedKeys: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Maximum size is 50MB.`);
          continue;
        }

        // Validate file type
        const allowedTypes = ['image/', 'video/', 'audio/', 'application/pdf'];
        if (!allowedTypes.some(type => file.type.startsWith(type))) {
          setError(`File ${file.name} has an unsupported type.`);
          continue;
        }

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Encrypt file client-side
        const { encryptedData, iv, key } = await encryptFile(
          new Uint8Array(arrayBuffer)
        );

        // Upload encrypted file
        const formData = new FormData();
        formData.append('file', new Blob([encryptedData]));
        formData.append('attemptId', attemptId);
        formData.append('fileName', file.name);
        formData.append('contentType', file.type);
        formData.append('iv', Buffer.from(iv).toString('base64'));
        formData.append('key', Buffer.from(key).toString('base64'));

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploadedKeys.push(data.fileKey);
        setUploadedFiles(prev => [...prev, file]);
      }

      setCurrentResponse({
        ...currentResponse,
        mediaKeys: [...(currentResponse.mediaKeys || []), ...uploadedKeys],
        stepId: currentStep.id,
      });
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Navigate to next step
  const handleNext = () => {
    // Validate required fields
    if (currentStep.required) {
      if (
        currentStep.type === 'TEXT' &&
        !currentResponse.textResponse?.trim()
      ) {
        setError('Please provide a response before continuing.');
        return;
      }

      if (
        currentStep.type === 'MULTIPLE_CHOICE' &&
        currentResponse.selectedOption === undefined
      ) {
        setError('Please select an option before continuing.');
        return;
      }

      if (
        currentStep.type === 'FILE_UPLOAD' &&
        (!currentResponse.mediaKeys || currentResponse.mediaKeys.length === 0)
      ) {
        setError('Please upload at least one file before continuing.');
        return;
      }
    }

    // Save current response
    setResponses(prev => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(
        r => r.stepId === currentStep.id
      );

      if (existingIndex >= 0) {
        updated[existingIndex] = currentResponse;
      } else {
        updated.push(currentResponse);
      }

      return updated;
    });

    // Move to next step
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);

      // Load previous response if it exists
      const existingResponse = responses.find(
        r => r.stepId === steps[nextIndex].id
      );

      setCurrentResponse(
        existingResponse || { stepId: steps[nextIndex].id }
      );
      setUploadedFiles([]);
      setError('');
    } else {
      // Last step, submit attempt
      handleSubmit();
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);

      // Load previous response
      const existingResponse = responses.find(
        r => r.stepId === steps[prevIndex].id
      );

      setCurrentResponse(
        existingResponse || { stepId: steps[prevIndex].id }
      );
      setError('');
    }
  };

  // Submit attempt for evaluation
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Include current response in final submission
      const finalResponses = [...responses];
      const existingIndex = finalResponses.findIndex(
        r => r.stepId === currentStep.id
      );

      if (existingIndex >= 0) {
        finalResponses[existingIndex] = currentResponse;
      } else {
        finalResponses.push(currentResponse);
      }

      const response = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: finalResponses,
          timeSpent: elapsedTime,
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit attempt');
      }

      const data = await response.json();

      // Redirect to results page
      router.push(`/attempts/${attemptId}/results`);
    } catch (error) {
      console.error('Submission error:', error);
      setError('Failed to submit your responses. Please try again.');
      setSubmitting(false);
    }
  };

  // Progress percentage
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/simulations/${simulation.id}`)}
                className="text-gray-600 hover:text-gray-900 transition"
                disabled={submitting}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {simulation.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStep.title}
            </h2>
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: currentStep.content }}
            />
          </div>

          {/* Response Area */}
          <div className="space-y-6">
            {/* Text Response */}
            {(currentStep.type === 'TEXT' || currentStep.type === 'COMBINED') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response {currentStep.required && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={currentResponse.textResponse || ''}
                  onChange={e => handleTextChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={8}
                  placeholder="Type your response here..."
                  disabled={submitting}
                />
              </div>
            )}

            {/* Multiple Choice */}
            {currentStep.type === 'MULTIPLE_CHOICE' && currentStep.options && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select your answer {currentStep.required && <span className="text-red-500">*</span>}
                </label>
                <div className="space-y-3">
                  {currentStep.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      className={`w-full text-left px-4 py-3 border-2 rounded-lg transition ${
                        currentResponse.selectedOption === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={submitting}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            currentResponse.selectedOption === index
                              ? 'border-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {currentResponse.selectedOption === index && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <span className="text-gray-900">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload */}
            {(currentStep.type === 'FILE_UPLOAD' ||
              currentStep.type === 'COMBINED') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files {currentStep.required && <span className="text-red-500">*</span>}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">
                    Drag and drop files here, or click to browse
                  </p>
                  <input
                    type="file"
                    onChange={e => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                    multiple
                    accept="image/*,video/*,audio/*,application/pdf"
                    disabled={uploading || submitting}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer ${
                      uploading || submitting
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Choose Files
                      </>
                    )}
                  </label>
                  <p className="text-xs text-gray-500 mt-3">
                    Supported: Images, Videos, Audio, PDF (Max 50MB each)
                  </p>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0 || submitting}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={submitting || uploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : currentStepIndex === steps.length - 1 ? (
                <>
                  Submit
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Your progress is automatically saved every 30 seconds. You can
            safely leave and return to this simulation at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
