import { TrendingUp, Brain, Download, Award } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your learning journey with detailed analytics and progress visualization.",
    color: "from-primary to-primary-light"
  },
  {
    icon: Brain,
    title: "Interactive Quizzes",
    description: "Test your knowledge with engaging quizzes and real-time feedback.",
    color: "from-accent to-green-400"
  },
  {
    icon: Download,
    title: "Downloadable Resources",
    description: "Access course materials, templates, and resources anytime, anywhere.",
    color: "from-secondary to-secondary-light"
  },
  {
    icon: Award,
    title: "Feedback & Certificates",
    description: "Get expert feedback and earn industry-recognized certificates.",
    color: "from-warning to-yellow-400"
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our platform provides all the tools and support you need to master MERN stack development and UI/UX design.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative"
            >
              <div className="h-full p-8 bg-gradient-card rounded-3xl shadow-card hover:shadow-soft transition-all duration-300 border border-border/50 hover:border-border">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};