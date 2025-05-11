import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

export default function Register() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen">
      <div className="pt-12 pb-6 text-center">
        <i className="ri-file-search-line text-5xl text-primary"></i>
        <h1 className="text-2xl font-bold font-roboto mt-2">Find My Document</h1>
        <p className="text-darkGray text-sm">Create your account</p>
      </div>
      
      <RegisterForm />
    </div>
  );
}
