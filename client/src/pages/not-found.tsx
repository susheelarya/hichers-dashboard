import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <Link 
            href="/"
            className="block w-full bg-black text-white text-center py-2 mt-4 hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
