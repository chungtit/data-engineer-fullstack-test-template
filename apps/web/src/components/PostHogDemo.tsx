import { posthog } from '../lib/posthog';

export const PostHogDemo = () => {
  const handleFeatureUsed = () => {
    posthog.capture('feature_used');
  };

  const handleGenerationFailed = () => {
    posthog.capture('generation_failed', {
      failure_reason: 'timeout',
      input_prompt: 'Generate a summary of the latest news',
    });
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-xl font-bold">PostHog Event Simulation</h2>
      <div className="flex gap-4">
        <button
          onClick={handleFeatureUsed}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
        >
          Simulate Feature Usage
        </button>
        <button
          onClick={handleGenerationFailed}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors"
        >
          Simulate Generation Failure
        </button>
      </div>
    </div>
  );
};

