import dashboardMockup from "../../assets/dashboadPreview.jpg";
import { CheckCircle, Clock, Trophy } from "lucide-react";

export const DashboardPreview = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Your Personal{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Learning Hub
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Stay organized and motivated with our intuitive dashboard. Track your progress, 
              manage assignments, and celebrate your achievements.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-green-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Real-time Progress Tracking
                  </h3>
                  <p className="text-muted-foreground">
                    See your completion rates, skill improvements, and milestone achievements instantly.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Smart Scheduling
                  </h3>
                  <p className="text-muted-foreground">
                    AI-powered recommendations help you optimize your learning schedule.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Achievement System
                  </h3>
                  <p className="text-muted-foreground">
                    Earn badges, certificates, and rewards as you progress through your journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dashboard Mockup */}
          <div className="relative p-32">
            <div className="relative z-10">
              <img
                src={dashboardMockup}
                alt="Student dashboard showing progress charts and course completion"
                className="w-full h-auto rounded-3xl shadow-card border border-border/20"
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-primary rounded-full opacity-20 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-secondary rounded-full opacity-30 blur-xl" />
            
            {/* Floating stats */}
            <div className="absolute top-6 -left-6 bg-card rounded-2xl shadow-card p-2 border border-border/20">
              <div className="text-sm text-muted-foreground">This Week</div>
              <div className="text-2xl font-bold text-foreground">24.5h</div>
              <div className="text-xs text-accent">+12% from last week</div>
            </div>
            
            <div className="absolute bottom-6 -right-6 bg-card rounded-2xl shadow-card p-4 border border-border/20">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold text-foreground">8/12</div>
              <div className="text-xs text-primary">Projects Done</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};