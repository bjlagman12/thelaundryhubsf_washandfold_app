const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    {/* Spinner */}
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-25 mb-4"></div>
    <span className="text-blue-700 text-lg font-medium">Loading...</span>
  </div>
);

export default LoadingScreen;
