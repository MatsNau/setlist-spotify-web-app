import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message = 'Loading...' }: LoadingSpinnerProps) => {
  return (
    <div className="text-center py-8">
      <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin mx-auto mb-2" />
      <p className="text-gray-300 text-sm md:text-base">{message}</p>
    </div>
  );
};