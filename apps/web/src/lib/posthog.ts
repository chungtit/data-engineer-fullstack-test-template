import posthog from 'posthog-js';

export const initPostHog = () => {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;

  if (apiKey) {
    posthog.init(apiKey, {
      api_host: host,
      capture_pageview: true,
    });
  }
};

export { posthog };
