import Head from 'next/head';
import Link from 'next/link';
import HealthStatus from '../components/HealthStatus';
import HealthIndicator from '../components/HealthIndicator';

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>ScreenGraph - Health Dashboard</title>
        <meta name="description" content="AI-driven crawling and verification system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ScreenGraph
                </h1>
                <p className="text-gray-600">
                  AI-driven crawling and verification system
                </p>
              </div>
              
              {/* Health Status Indicator */}
              <div className="flex items-center space-x-4">
                <HealthIndicator />
                <Link 
                  href="/graph"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Graphs
                </Link>
              </div>
            </div>
          </div>

          {/* Health Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              System Health
            </h2>
            <HealthStatus />
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Database
              </h3>
              <p className="text-sm text-gray-600">
                PostgreSQL connection status and performance metrics
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Agent Service
              </h3>
              <p className="text-sm text-gray-600">
                Fastify API server status and endpoint availability
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Queue System
              </h3>
              <p className="text-sm text-gray-600">
                BullMQ and Redis queue processing status
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
