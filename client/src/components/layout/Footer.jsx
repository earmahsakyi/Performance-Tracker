import { Heart, Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground dark:bg-background text-white dark:text-foreground py-16 border-t dark:border-border">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-secondary bg-clip-text text-transparent">
              Trackademy
            </h3>
            <p className="text-white/80 dark:text-muted-foreground mb-6 leading-relaxed">
              Empowering the next generation of developers and designers through hands-on learning and mentorship.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 dark:bg-muted rounded-xl flex items-center justify-center hover:bg-white/20 dark:hover:bg-muted/80 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 dark:bg-muted rounded-xl flex items-center justify-center hover:bg-white/20 dark:hover:bg-muted/80 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 dark:bg-muted rounded-xl flex items-center justify-center hover:bg-white/20 dark:hover:bg-muted/80 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Courses */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">Courses</h4>
            <ul className="space-y-3 text-white/80 dark:text-muted-foreground">
              <li><a href="#" className="hover:text-white dark:hover:text-foreground transition-colors">MERN Stack Bootcamp</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-foreground transition-colors">UI/UX Design Track</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-foreground transition-colors">Full-Stack Development</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-foreground transition-colors">React Advanced</a></li>
            </ul>
          </div>
          
          
          
          {/* Support */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">Support</h4>
            <ul className="space-y-3 text-white/80 dark:text-muted-foreground">
              <li><a href="#" className="hover:text-white dark:hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-foreground transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-foreground transition-colors">Student Resources</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-white/20 dark:border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 dark:text-muted-foreground text-center md:text-left">
            © 2025 Trackademy. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2 text-white/60 dark:text-muted-foreground">
            <span>Your learning journey starts here!</span>
            <Heart className="h-4 w-4 text-secondary" />
          </div>
        </div>
      </div>
    </footer>
  );
};