export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-stone-200 border-t-[#F4A261] ${className}`} />
  );
}
