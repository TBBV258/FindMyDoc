import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export default function Splash() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    // Wait for 2 seconds before checking user status
    const timeout = setTimeout(() => {
      if (user) {
        navigate("/home");
      } else {
        navigate("/login");
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [user, navigate]);

  return (
    <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center z-50">
      <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-8">
        <i className="ri-file-search-line text-6xl text-primary"></i>
      </div>
      <h1 className="text-white text-3xl font-bold font-roboto mb-2">Find My Document</h1>
      <p className="text-white text-lg font-openSans">Mozambique's Document Recovery</p>
      <div className="mt-10 w-16 h-1 bg-white/30 rounded-full relative overflow-hidden">
        <div 
          className="absolute h-full bg-white rounded-full animate-pulse"
          style={{ width: '50%' }}
        ></div>
      </div>
    </div>
  );
}
