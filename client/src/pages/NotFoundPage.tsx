import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">🍬</div>
      <h1 className="text-4xl font-bold text-stone-900 mb-2">404</h1>
      <p className="text-stone-500 mb-6">This page doesn't exist.</p>
      <Link to="/" className="bg-[#C0392B] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#a93226] transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
