import { motion } from "framer-motion";
import { LayoutTemplate, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const templates = [
  {
    id: 1,
    title: "Product Launch",
    description: "Announce your new product with a professional AI presenter",
    category: "Marketing",
    duration: "60s",
    script: "Introducing our latest innovation that will transform the way you work...",
  },
  {
    id: 2,
    title: "Sales Pitch",
    description: "Deliver a compelling sales pitch to potential clients",
    category: "Sales",
    duration: "90s",
    script: "Are you looking for a solution that saves time and increases revenue?...",
  },
  {
    id: 3,
    title: "Training Video",
    description: "Create engaging employee training content",
    category: "HR",
    duration: "120s",
    script: "Welcome to the onboarding training program. In this module...",
  },
  {
    id: 4,
    title: "Customer Testimonial",
    description: "Share customer success stories with AI avatars",
    category: "Marketing",
    duration: "45s",
    script: "Since we started using this platform, our team productivity has increased...",
  },
  {
    id: 5,
    title: "Newsletter Recap",
    description: "Turn your weekly newsletter into a video summary",
    category: "Content",
    duration: "60s",
    script: "Here's what happened this week in our company...",
  },
  {
    id: 6,
    title: "How-To Guide",
    description: "Step-by-step tutorial with an AI instructor",
    category: "Education",
    duration: "180s",
    script: "In this tutorial, I'll walk you through the steps to get started...",
  },
  {
    id: 7,
    title: "Event Invitation",
    description: "Invite attendees to your upcoming event",
    category: "Events",
    duration: "30s",
    script: "You're invited to our annual conference happening on...",
  },
  {
    id: 8,
    title: "Explainer Video",
    description: "Explain complex topics in simple terms",
    category: "Education",
    duration: "90s",
    script: "Have you ever wondered how AI video generation works? Let me explain...",
  },
];

const Templates = () => {
  const navigate = useNavigate();

  const useTemplate = (template: typeof templates[0]) => {
    navigate(`/create?template=${template.id}`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Templates</h1>
        <p className="text-muted-foreground mt-1">Start with a pre-built template to create videos faster</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass hover:border-primary/50 transition-all group cursor-pointer h-full flex flex-col">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <LayoutTemplate className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                  <span className="text-xs text-muted-foreground">{template.duration}</span>
                </div>
                <h3 className="font-semibold text-foreground">{template.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex-1">{template.description}</p>
                <Button
                  className="w-full mt-4 group-hover:gradient-primary transition-all"
                  variant="outline"
                  onClick={() => useTemplate(template)}
                >
                  Use Template <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
