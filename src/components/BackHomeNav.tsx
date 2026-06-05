import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackHomeNavProps {
  className?: string;
}

const BackHomeNav = ({ className = "" }: BackHomeNavProps) => {
  const navigate = useNavigate();
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Button>
      <Button variant="outline" size="sm" onClick={() => navigate("/")}>
        <Home className="w-4 h-4 mr-1" />
        Home
      </Button>
    </div>
  );
};

export default BackHomeNav;
