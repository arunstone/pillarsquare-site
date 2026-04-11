import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 Not Found | Pillar Square Properties</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-7xl font-bold text-brand-500">404</p>
        <h1 className="text-2xl font-display font-semibold text-charcoal-900 mt-4 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </>
  );
}
