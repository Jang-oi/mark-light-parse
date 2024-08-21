import { useLoadingStore } from '@/store/loadingStore.ts'; // import your store

const LoadingModal = () => {
  const { isLoading } = useLoadingStore();
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
        <p className="text-white dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingModal;
