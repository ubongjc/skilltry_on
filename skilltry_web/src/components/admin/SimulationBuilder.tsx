'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Step {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'MULTIPLE_CHOICE' | 'FILE_UPLOAD' | 'COMBINED';
  options?: string[];
  required: boolean;
}

interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

interface TrainingLink {
  title: string;
  url: string;
  provider: string;
}

export default function SimulationBuilder({
  initialData,
}: {
  initialData?: any;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [sector, setSector] = useState(initialData?.sector || '');
  const [difficulty, setDifficulty] = useState(
    initialData?.difficulty || 'MEDIUM'
  );
  const [estimatedDuration, setEstimatedDuration] = useState(
    initialData?.estimatedDuration || 10
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.thumbnailUrl || ''
  );

  const [steps, setSteps] = useState<Step[]>(
    initialData?.steps || [
      {
        id: crypto.randomUUID(),
        title: '',
        content: '',
        type: 'TEXT',
        required: true,
      },
    ]
  );

  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>(
    initialData?.rubric?.criteria || [
      {
        name: 'Communication',
        description: 'Clear and professional communication',
        weight: 0.3,
        maxScore: 10,
      },
    ]
  );

  const [trainingLinks, setTrainingLinks] = useState<TrainingLink[]>(
    initialData?.resources?.trainingLinks || []
  );

  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished || false
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step Management
  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: crypto.randomUUID(),
        title: '',
        content: '',
        type: 'TEXT',
        required: true,
      },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newSteps = [...steps];
      [newSteps[index - 1], newSteps[index]] = [
        newSteps[index],
        newSteps[index - 1],
      ];
      setSteps(newSteps);
    } else if (direction === 'down' && index < steps.length - 1) {
      const newSteps = [...steps];
      [newSteps[index], newSteps[index + 1]] = [
        newSteps[index + 1],
        newSteps[index],
      ];
      setSteps(newSteps);
    }
  };

  const updateStep = (index: number, field: keyof Step, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const addOption = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].options = [
      ...(newSteps[stepIndex].options || []),
      '',
    ];
    setSteps(newSteps);
  };

  const removeOption = (stepIndex: number, optionIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].options = newSteps[stepIndex].options?.filter(
      (_, i) => i !== optionIndex
    );
    setSteps(newSteps);
  };

  const updateOption = (
    stepIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newSteps = [...steps];
    if (newSteps[stepIndex].options) {
      newSteps[stepIndex].options![optionIndex] = value;
    }
    setSteps(newSteps);
  };

  // Rubric Management
  const addCriterion = () => {
    setRubricCriteria([
      ...rubricCriteria,
      {
        name: '',
        description: '',
        weight: 0.1,
        maxScore: 10,
      },
    ]);
  };

  const removeCriterion = (index: number) => {
    if (rubricCriteria.length > 1) {
      setRubricCriteria(rubricCriteria.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (
    index: number,
    field: keyof RubricCriterion,
    value: any
  ) => {
    const newCriteria = [...rubricCriteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setRubricCriteria(newCriteria);
  };

  // Training Links Management
  const addTrainingLink = () => {
    setTrainingLinks([
      ...trainingLinks,
      {
        title: '',
        url: '',
        provider: '',
      },
    ]);
  };

  const removeTrainingLink = (index: number) => {
    setTrainingLinks(trainingLinks.filter((_, i) => i !== index));
  };

  const updateTrainingLink = (
    index: number,
    field: keyof TrainingLink,
    value: string
  ) => {
    const newLinks = [...trainingLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setTrainingLinks(newLinks);
  };

  // Validation
  const validate = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }

    if (!description.trim()) {
      setError('Description is required');
      return false;
    }

    if (!sector.trim()) {
      setError('Sector is required');
      return false;
    }

    if (steps.length === 0) {
      setError('At least one step is required');
      return false;
    }

    for (const [index, step] of steps.entries()) {
      if (!step.title.trim()) {
        setError(`Step ${index + 1}: Title is required`);
        return false;
      }

      if (!step.content.trim()) {
        setError(`Step ${index + 1}: Content is required`);
        return false;
      }

      if (
        step.type === 'MULTIPLE_CHOICE' &&
        (!step.options || step.options.length < 2)
      ) {
        setError(
          `Step ${index + 1}: Multiple choice requires at least 2 options`
        );
        return false;
      }
    }

    if (rubricCriteria.length === 0) {
      setError('At least one rubric criterion is required');
      return false;
    }

    const totalWeight = rubricCriteria.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      setError(
        `Rubric weights must sum to 1.0 (currently ${totalWeight.toFixed(2)})`
      );
      return false;
    }

    for (const [index, criterion] of rubricCriteria.entries()) {
      if (!criterion.name.trim()) {
        setError(`Criterion ${index + 1}: Name is required`);
        return false;
      }
    }

    return true;
  };

  // Save Simulation
  const handleSave = async (publish: boolean = false) => {
    setError('');

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const simulationData = {
        title,
        description,
        sector,
        difficulty,
        estimatedDuration,
        thumbnailUrl: thumbnailUrl || null,
        steps,
        rubric: {
          criteria: rubricCriteria,
        },
        resources: {
          trainingLinks,
        },
        isPublished: publish,
      };

      const endpoint = initialData
        ? `/api/simulations/${initialData.id}`
        : '/api/simulations';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulationData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save simulation');
      }

      const data = await response.json();

      // Redirect to simulation list or detail page
      router.push('/admin/simulations');
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to save simulation'
      );
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/simulations')}
            className="p-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {initialData ? 'Edit Simulation' : 'Create New Simulation'}
            </h1>
            <p className="text-gray-600 mt-1">
              Build a realistic job scenario with AI-powered feedback
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Customer Service Challenge"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Brief description of what users will practice"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Retail, Technology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty <span className="text-red-500">*</span>
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) =>
                    setEstimatedDuration(parseInt(e.target.value))
                  }
                  min="5"
                  max="60"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL (optional)
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Simulation Steps
            </h2>
            <button
              onClick={addStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Step {index + 1}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveStep(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveStep(index, 'down')}
                      disabled={index === steps.length - 1}
                      className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeStep(index)}
                      disabled={steps.length === 1}
                      className="p-1 text-red-600 hover:text-red-700 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Step Title
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) =>
                        updateStep(index, 'title', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Greeting the Customer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content / Scenario
                    </label>
                    <textarea
                      value={step.content}
                      onChange={(e) =>
                        updateStep(index, 'content', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="Describe the scenario and what the user should do..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Type
                      </label>
                      <select
                        value={step.type}
                        onChange={(e) =>
                          updateStep(
                            index,
                            'type',
                            e.target.value as Step['type']
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="TEXT">Text Response</option>
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="FILE_UPLOAD">File Upload</option>
                        <option value="COMBINED">Combined</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={step.required}
                          onChange={(e) =>
                            updateStep(index, 'required', e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Required
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Multiple Choice Options */}
                  {(step.type === 'MULTIPLE_CHOICE' ||
                    step.type === 'COMBINED') && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Answer Options
                        </label>
                        <button
                          onClick={() => addOption(index)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add Option
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(step.options || []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateOption(index, optionIndex, e.target.value)
                              }
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <button
                              onClick={() => removeOption(index, optionIndex)}
                              className="p-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {(!step.options || step.options.length === 0) && (
                          <p className="text-sm text-gray-500 italic">
                            No options added yet. Click "Add Option" to start.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rubric Criteria */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Evaluation Rubric
            </h2>
            <button
              onClick={addCriterion}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Criterion
            </button>
          </div>

          <div className="space-y-4">
            {rubricCriteria.map((criterion, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Criterion {index + 1}
                  </h3>
                  <button
                    onClick={() => removeCriterion(index)}
                    disabled={rubricCriteria.length === 1}
                    className="p-1 text-red-600 hover:text-red-700 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={criterion.name}
                      onChange={(e) =>
                        updateCriterion(index, 'name', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Communication"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={criterion.description}
                      onChange={(e) =>
                        updateCriterion(index, 'description', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What this criterion evaluates"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (0-1)
                    </label>
                    <input
                      type="number"
                      value={criterion.weight}
                      onChange={(e) =>
                        updateCriterion(
                          index,
                          'weight',
                          parseFloat(e.target.value)
                        )
                      }
                      min="0"
                      max="1"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Score
                    </label>
                    <input
                      type="number"
                      value={criterion.maxScore}
                      onChange={(e) =>
                        updateCriterion(
                          index,
                          'maxScore',
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Total Weight:</strong>{' '}
                {rubricCriteria.reduce((sum, c) => sum + c.weight, 0).toFixed(2)}{' '}
                (must equal 1.0)
              </p>
            </div>
          </div>
        </div>

        {/* Training Resources */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Training Resources
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Recommended training links for users to improve
              </p>
            </div>
            <button
              onClick={addTrainingLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Link
            </button>
          </div>

          {trainingLinks.length > 0 ? (
            <div className="space-y-4">
              {trainingLinks.map((link, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Training Link {index + 1}
                    </h3>
                    <button
                      onClick={() => removeTrainingLink(index)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) =>
                          updateTrainingLink(index, 'title', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Course or resource name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL
                      </label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          updateTrainingLink(index, 'url', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provider
                      </label>
                      <input
                        type="text"
                        value={link.provider}
                        onChange={(e) =>
                          updateTrainingLink(index, 'provider', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Coursera, Udemy"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-8">
              No training links added yet
            </p>
          )}
        </div>

        {/* Publish Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="publish"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="publish" className="text-sm text-gray-700">
              <strong>Publish Immediately</strong> - Make this simulation
              visible to all users
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
