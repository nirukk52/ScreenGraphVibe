import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AppLaunchConfigResponse } from '@screengraph/data';

interface SetupPageProps {}

const SetupPage: React.FC<SetupPageProps> = () => {
  const [configs, setConfigs] = useState<AppLaunchConfigResponse[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Fetch app launch configurations
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/app-launch-configs');
        const data = await response.json();

        if (data.success) {
          setConfigs(data.data);
          // Set the first config as default selection
          if (data.data.length > 0) {
            setSelectedConfig(data.data[0].id);
          }
        } else {
          setError(data.error || 'Failed to fetch configurations');
        }
      } catch (err) {
        setError('Failed to connect to the server');
        console.error('Error fetching configs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  const handleGo = async () => {
    if (!selectedConfig) {
      setError('Please select a configuration');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      // Get the selected configuration
      const config = configs.find((c) => c.id === selectedConfig);
      if (!config) {
        setError('Selected configuration not found');
        return;
      }

      // Here you would typically start the crawl with the selected configuration
      // For now, we'll just show a success message
      console.log('Starting crawl with config:', config);

      // Simulate API call to start crawl
      const response = await fetch('http://localhost:3000/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appLaunchConfig: {
            apkPath: config.apkPath,
            packageName: config.packageName,
            appActivity: config.appActivity,
            appiumServerUrl: config.appiumServerUrl,
          },
        }),
      });

      if (response.ok) {
        alert('Crawl started successfully! Check the status page for progress.');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to start crawl');
      }
    } catch (err) {
      setError('Failed to start crawl');
      console.error('Error starting crawl:', err);
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Setup - ScreenGraph</title>
        <meta name="description" content="Configure and start your ScreenGraph crawl" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup</h1>
              <p className="text-gray-600">Configure your app launch settings and start crawling</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Appium Server URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appium Server URL
                </label>
                <select
                  value={selectedConfig}
                  onChange={(e) => setSelectedConfig(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a configuration</option>
                  {configs.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.name} - {config.appiumServerUrl}
                    </option>
                  ))}
                </select>
              </div>

              {/* App Package */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">App Package</label>
                <select
                  value={selectedConfig}
                  onChange={(e) => setSelectedConfig(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a configuration</option>
                  {configs.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.name} - {config.packageName}
                    </option>
                  ))}
                </select>
              </div>

              {/* APK Path */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">APK Path</label>
                <select
                  value={selectedConfig}
                  onChange={(e) => setSelectedConfig(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a configuration</option>
                  {configs.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.name} - {config.apkPath}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Configuration Details */}
              {selectedConfig && (
                <div className="bg-gray-50 rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Selected Configuration</h3>
                  {(() => {
                    const config = configs.find((c) => c.id === selectedConfig);
                    return config ? (
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Name:</span> {config.name}
                        </div>
                        <div>
                          <span className="font-medium">Appium URL:</span> {config.appiumServerUrl}
                        </div>
                        <div>
                          <span className="font-medium">Package:</span> {config.packageName}
                        </div>
                        <div>
                          <span className="font-medium">Activity:</span> {config.appActivity}
                        </div>
                        <div>
                          <span className="font-medium">APK Path:</span> {config.apkPath}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Go Button */}
              <button
                onClick={handleGo}
                disabled={!selectedConfig || isStarting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Starting...
                  </>
                ) : (
                  'Go'
                )}
              </button>
            </div>

            {/* Navigation Links */}
            <div className="mt-8 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SetupPage;
