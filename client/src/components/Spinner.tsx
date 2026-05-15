export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-red-100 border-t-[#C41230] ${className}`} />
  );
}
