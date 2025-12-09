import { Link } from "react-router-dom";
import { Brain, Clock, BookOpen } from "lucide-react";
import MaleIcon from "@/assets/male.svg";
import FemaleIcon from "@/assets/female.svg";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero relative">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">MindProfile</span>
          </Link>

          <Link to="/admin/login">
            <Button variant="ghost" size="sm">Admin</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-14 pb-24">
        <div className="max-w-2xl mx-auto text-center fade-up">

          {/* Main Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            A Personalized <span className="text-gradient-primary">Performance Plan</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-600 max-w-lg mx-auto mb-8">
            Elevate your daily performance with a personalized plan tailored to your unique patterns.
          </p>

          {/* Gender Selection Title */}
          <p className="text-base font-semibold text-foreground mb-4">
            Select your profile to begin
          </p>

          {/* Gender Selection Cards */}
          <div className="flex justify-center gap-7 mt-2">

            {/* Male */}
            <button
              onClick={() => (window.location.href = "/quiz?gender=male")}
              className="w-48 h-60 bg-white rounded-2xl border border-slate-200/60 
                         shadow-md shadow-slate-200/40
                         hover:shadow-lg hover:scale-[1.05] transition-all 
                         flex flex-col items-center justify-center gap-5"
            >
              <img src={MaleIcon} alt="Male" className="w-32 h-32 object-contain drop-shadow-sm" />
              <span className="text-lg font-semibold text-slate-800">Male</span>
            </button>

            {/* Female */}
            <button
              onClick={() => (window.location.href = "/quiz?gender=female")}
              className="w-48 h-60 bg-white rounded-2xl border border-slate-200/60 
                         shadow-md shadow-slate-200/40
                         hover:shadow-lg hover:scale-[1.05] transition-all 
                         flex flex-col items-center justify-center gap-5"
            >
              <img src={FemaleIcon} alt="Female" className="w-32 h-32 object-contain drop-shadow-sm" />
              <span className="text-lg font-semibold text-slate-800">Female</span>
            </button>

          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground mt-4 max-w-xs mx-auto leading-relaxed">
            By clicking <strong>“Male”</strong> or <strong>“Female”</strong>, you agree to our{" "}
            <Link to="/terms" className="underline hover:text-primary">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground mt-10">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm">3 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm">Personalized plan</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm">Science-based</span>
            </div>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl -z-10" />
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MindProfile. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
