import React from "react";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore.js";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../AuthImagePattern.jsx";
import {  toast } from "react-hot-toast";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const { isSigningUp, signup } = useAuthStore();

  const handleFormValidate = () => {
    if(!formData.fullname.trim()) return toast.error("Fullname is required");
    if(!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if(!formData.password) return  toast.error("Password is required");
    if(formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true
  };
  const handleSubmit = (e) => {
      e.preventDefault();

      const isValid = handleFormValidate();

      if(isValid == true) signup(formData);
  }
  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* left-side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">

        <div className="w-full max-w-md space-y-8 ">
            {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>
        </div>

        {/* form  */}

        <form onSubmit={handleSubmit} className="space-y-6 ">
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Full Name</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <User className="w-5 h-5 text-base-content/40" />
                    </div>
                    <input
                        type="text"
                        id="fullname"
                        name="fullname"
                        className="input input-bordered w-full pl-10"
                        value = {formData.fullname}
                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    />
                </div>
            </div>
 
            <div className="form-control ">
                <label className="label">
                    <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="w-5 h-5 text-base-content/40" />
                    </div>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="input input-bordered w-full pl-10"
                        value = {formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="w-5 h-5 text-base-content/40" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className="input input-bordered w-full pl-10"
                        value = {formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5 text-base-content/40" />
                        ) : (
                            <Eye className="w-5 h-5 text-base-content/40" />
                        )    
                        }
                    </button>
                </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
                {isSigningUp ? (
                    <>
                    <Loader2 className="size-5 animate-spin "/>
                    "Signing up..."
                    </>
                    ) : ("Sign up")}
            </button>

        </form>

        <div className="text-center">
            <p className="text-base-content/60">
                Already have an account?{" "}
                <Link to="/login" className="link link-primary">
                    Log in
                </Link>
            </p>
        </div>
      </div>

      {/* right size */}
                    
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />

    </div>
  );
}

export default Signup;
