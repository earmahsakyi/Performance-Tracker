import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroStudents from "../../assets/hero2.jpg";
import {Link} from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Learn, Track, and{" "}
              <span className="bg-gradient-secondary bg-clip-text text-transparent">
                Grow Your Skills!
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Master MERN and UI/UX with real projects and track your progress. 
              Join thousands of students building their dream careers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button  className="text-lg px-8 py-4 h-auto
              relative overflow-hidden group
              bg-gradient-to-r from-blue-600 to-purple-600
              hover:from-blue-700 hover:to-purple-700
              transform transition-all duration-300
              hover:scale-105 hover:-translate-y-1
              hover:shadow-2xl hover:shadow-blue-500/25
              active:scale-95
              focus:ring-4 focus:ring-blue-500/50
              before:absolute before:inset-0
              before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0
              before:translate-x-[-100%] hover:before:translate-x-[100%]
              before:transition-transform before:duration-700">
              Join the Bootcamp
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button variant="hero-outline" size="lg" className="
              text-lg px-8 py-4 h-auto
          relative overflow-hidden group
          border-2 border-white/30 text-white
          hover:border-white hover:bg-white/10
          backdrop-blur-sm
          transform transition-all duration-300
          hover:scale-105 hover:-translate-y-1
          hover:shadow-2xl hover:shadow-white/20
          active:scale-95
          focus:ring-4 focus:ring-white/30
          before:absolute before:inset-0
          before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent
          before:translate-y-[100%] hover:before:translate-y-0
          before:transition-transform before:duration-500
              "
              >
                <Play className="mr-2 h-5 w-5" />
                Explore Courses
              </Button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-8 mt-12 text-white/80">
              <div className="text-center">
                <div className="text-2xl font-bold">5,000+</div>
                <div className="text-sm">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm">Support</div>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative p-16">
            <div className="relative z-10">
              <img
                src={heroStudents}
                alt="Students collaborating and learning on digital platforms"
                className="w-full h-auto rounded-3xl shadow-hero"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center shadow-soft animate-bounce">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="absolute -bottom-0 -left-6  w-20 h-20 bg-accent rounded-3xl flex items-center justify-center shadow-soft animate-pulse">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};