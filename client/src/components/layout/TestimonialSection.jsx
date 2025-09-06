import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Frontend Developer at Google",
    content: "SkillForge transformed my career! The hands-on projects and mentorship helped me land my dream job. The progress tracking kept me motivated throughout.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
    rating: 5
  },
  {
    name: "Marcus Johnson",
    role: "Full-Stack Developer",
    content: "Best bootcamp experience ever! The curriculum is comprehensive and the community is incredibly supportive. I went from zero to hero in 6 months.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "UI/UX Designer at Airbnb",
    content: "The UI/UX track exceeded my expectations. Real client projects and expert feedback helped me build an amazing portfolio that got me hired!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    rating: 5
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            What Our{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Students Say
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of successful graduates who transformed their careers with Trackademy.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-gradient-card p-8 rounded-3xl shadow-card border border-border/50 hover:shadow-soft transition-all duration-300 group"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};