interface SuccessMessageProps {
  onRedirect?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function SuccessMessage(_opts: SuccessMessageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 p-2">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful!</h2>
        <p className="mt-2 text-gray-600">Redirecting you to the app...</p>
      </div>
    </div>
  );
}
