import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";

interface AuthRequiredProps {
  title?: string;
  description?: string;
}

export default function AuthRequired({ 
  title = "Authentication Required", 
  description = "Please sign in to access this feature." 
}: AuthRequiredProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Alert className="max-w-md border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm mt-1">{description}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}