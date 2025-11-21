import React from "react";
import { motion } from "framer-motion";
import { X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const CategoryModal = ({ isOpen, onClose, onSubmit, category, mode = "create" }) => {
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    color: "bg-blue-500",
    icon: "MessageSquare",
    requiresModeration: false,
    allowStudentPosts: true
  });

  const [loading, setLoading] = React.useState(false);
  

  React.useEffect(() => {
    if (category && mode === "edit") {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        color: category.color || "bg-blue-500",
        icon: category.icon || "MessageSquare",
        requiresModeration: category.requiresModeration || false,
        allowStudentPosts: category.allowStudentPosts !== false
      });
    }
  }, [category, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
          name: "",
          description: "",
          color: "bg-blue-500",
          icon: "MessageSquare",
          requiresModeration: false,
          allowStudentPosts: true
        });
    } catch (error) {
      console.error("Error submitting category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-lg shadow-card border border-border w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {mode === "create" ? "Create Category" : "Edit Category"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter category description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleChange("color", e.target.value)}
                placeholder="bg-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
                placeholder="MessageSquare"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="requiresModeration" className="flex flex-col space-y-1">
                <span>Requires Moderation</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Posts require approval before being published
                </span>
              </Label>
              <Switch
                id="requiresModeration"
                checked={formData.requiresModeration}
                onCheckedChange={(checked) => handleChange("requiresModeration", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allowStudentPosts" className="flex flex-col space-y-1">
                <span>Allow Student Posts</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Students can create posts in this category
                </span>
              </Label>
              <Switch
                id="allowStudentPosts"
                checked={formData.allowStudentPosts}
                onCheckedChange={(checked) => handleChange("allowStudentPosts", checked)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.description}
            >
              {loading ? "Saving..." : mode === "create" ? "Create Category" : "Save Changes"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};