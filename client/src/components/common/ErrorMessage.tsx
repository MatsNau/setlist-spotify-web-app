import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;

  return (
    <div className="bg-red-500/20 backdrop-blur-md rounded-lg p-3 md:p-4 mb-4 md:mb-6 mx-4 md:mx-0 flex items-start gap-2 text-white">
      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
      <span className="text-sm md:text-base">{message}</span>
    </div>
  );
};