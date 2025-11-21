import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  BookOpen, Plus, Edit, Trash2, GripVertical, ChevronDown, ChevronUp,
  Video, FileText, Link as LinkIcon, Image, Calendar, X, Loader2,
  AlertCircle, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import toast from "react-hot-toast";
import {
  getCourseModules,
  addCourseModule,
  updateCourseModule,
  deleteCourseModule,
  reorderCourseModules,
} from "../../../actions/courseAction";

export default function ModuleManagement({ course, isOpen, onClose }) {
  const dispatch = useDispatch();
  const { courseModules, moduleLoading } = useSelector((state) => state.course);

  // Local state
  const [modules, setModules] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resources: [],
    assignments: [],
  });

  // Load modules when dialog opens
  useEffect(() => {
    if (isOpen && course?._id) {
      dispatch(getCourseModules(course._id));
    }
  }, [isOpen, course, dispatch]);

  // Update local modules when courseModules changes
  useEffect(() => {
    if (courseModules?.modules) {
      setModules(courseModules.modules);
    }
  }, [courseModules]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      resources: [],
      assignments: [],
    });
  };

  // Handle reorder
  const handleReorder = (newOrder) => {
    setModules(newOrder);
    setHasChanges(true);
  };

  // Save reordered modules
  const saveReorder = async () => {
    const newOrder = modules.map((_, index) => {
      const originalIndex = courseModules.modules.findIndex(
        (m) => m._id === modules[index]._id
      );
      return originalIndex;
    });

    try {
      await dispatch(reorderCourseModules(course._id, newOrder));
      toast.success("Modules reordered successfully!");
      setHasChanges(false);
      dispatch(getCourseModules(course._id));
    } catch (error) {
      toast.error("Failed to reorder modules");
    }
  };

  // Add resource to form
  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      resources: [
        ...prev.resources,
        { type: "video", url: "", title: "", description: "" },
      ],
    }));
  };

  // Remove resource
  const removeResource = (index) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  // Update resource
  const updateResource = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      ),
    }));
  };

  // Add assignment to form
  const addAssignment = () => {
    setFormData((prev) => ({
      ...prev,
      assignments: [
        ...prev.assignments,
        { title: "", description: "", dueDate: "" },
      ],
    }));
  };

  // Remove assignment
  const removeAssignment = (index) => {
    setFormData((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((_, i) => i !== index),
    }));
  };

  // Update assignment
  const updateAssignment = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a, i) =>
        i === index ? { ...a, [field]: value } : a
      ),
    }));
  };

  // Handle add module
  const handleAddModule = async () => {
    if (!formData.title) {
      toast.error("Module title is required");
      return;
    }

    try {
      await dispatch(addCourseModule(course._id, formData));
      toast.success("Module added successfully!");
      setShowAddModal(false);
      resetForm();
      dispatch(getCourseModules(course._id));
    } catch (error) {
      toast.error("Failed to add module");
    }
  };

  // Handle edit module
  const openEditModal = (moduleIndex) => {
    const module = modules[moduleIndex];
    setSelectedModuleIndex(moduleIndex);
    setFormData({
      title: module.title || "",
      description: module.description || "",
      resources: module.resources || [],
      assignments: module.assignments || [],
    });
    setShowEditModal(true);
  };

  const handleEditModule = async () => {
    if (!formData.title) {
      toast.error("Module title is required");
      return;
    }

    try {
      await dispatch(updateCourseModule(course._id, selectedModuleIndex, formData));
      toast.success("Module updated successfully!");
      setShowEditModal(false);
      resetForm();
      setSelectedModuleIndex(null);
      dispatch(getCourseModules(course._id));
    } catch (error) {
      toast.error("Failed to update module");
    }
  };

  // Handle delete module
  const openDeleteModal = (moduleIndex) => {
    setSelectedModuleIndex(moduleIndex);
    setShowDeleteModal(true);
  };

  const handleDeleteModule = async () => {
    try {
      await dispatch(deleteCourseModule(course._id, selectedModuleIndex));
      toast.success("Module deleted successfully!");
      setShowDeleteModal(false);
      setSelectedModuleIndex(null);
      dispatch(getCourseModules(course._id));
    } catch (error) {
      toast.error("Failed to delete module");
    }
  };

  // Get resource icon
  const getResourceIcon = (type) => {
    const icons = {
      video: Video,
      document: FileText,
      link: LinkIcon,
      image: Image,
    };
    const Icon = icons[type] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Manage Modules: {course?.title}
          </DialogTitle>
          <DialogDescription>
            {course?.code} • {modules.length} module{modules.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {moduleLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center p-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first module to get started
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Module
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  Drag modules to reorder
                </div>
                {hasChanges && (
                  <Button onClick={saveReorder} size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Save Order
                  </Button>
                )}
              </div>

              <Reorder.Group
                axis="y"
                values={modules}
                onReorder={handleReorder}
                className="space-y-3"
              >
                {modules.map((module, index) => (
                  <Reorder.Item
                    key={module._id}
                    value={module}
                    className="bg-card border border-border rounded-lg p-4 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                Module {index + 1}
                              </Badge>
                              <h4 className="font-semibold text-foreground">
                                {module.title}
                              </h4>
                            </div>
                            {module.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {module.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModal(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {module.resources?.length || 0} resource{module.resources?.length !== 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {module.assignments?.length || 0} assignment{module.assignments?.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {(module.resources?.length > 0 || module.assignments?.length > 0) && (
                          <Accordion type="single" collapsible className="mt-3">
                            <AccordionItem value="details" className="border-0">
                              <AccordionTrigger className="py-2 text-sm hover:no-underline">
                                View Details
                              </AccordionTrigger>
                              <AccordionContent className="space-y-3 pt-2">
                                {module.resources?.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium mb-2">Resources</h5>
                                    <div className="space-y-2">
                                      {module.resources.map((resource, rIndex) => (
                                        <div
                                          key={rIndex}
                                          className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded"
                                        >
                                          {getResourceIcon(resource.type)}
                                          <span className="flex-1 truncate">
                                            {resource.title || resource.url}
                                          </span>
                                          <Badge variant="outline" className="text-xs">
                                            {resource.type}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {module.assignments?.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium mb-2">Assignments</h5>
                                    <div className="space-y-2">
                                      {module.assignments.map((assignment, aIndex) => (
                                        <div
                                          key={aIndex}
                                          className="text-sm p-2 bg-muted/50 rounded"
                                        >
                                          <div className="font-medium">{assignment.title}</div>
                                          {assignment.dueDate && (
                                            <div className="text-xs text-muted-foreground">
                                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between border-t pt-4">
          <Button variant="outline" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>

      {/* Add Module Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>
              Create a new module with resources and assignments
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Module Title *</Label>
              <Input
                id="module-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Introduction to React"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Module description..."
                rows={3}
              />
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Resources</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addResource}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </div>

              {formData.resources.map((resource, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Resource {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResource(index)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={resource.type}
                        onValueChange={(value) =>
                          updateResource(index, "type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={resource.title}
                        onChange={(e) =>
                          updateResource(index, "title", e.target.value)
                        }
                        placeholder="Resource title"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">URL</Label>
                    <Input
                      value={resource.url}
                      onChange={(e) =>
                        updateResource(index, "url", e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Assignments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Assignments</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAssignment}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assignment
                </Button>
              </div>

              {formData.assignments.map((assignment, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Assignment {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAssignment(index)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={assignment.title}
                        onChange={(e) =>
                          updateAssignment(index, "title", e.target.value)
                        }
                        placeholder="Assignment title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Due Date</Label>
                      <Input
                        type="date"
                        value={assignment.dueDate}
                        onChange={(e) =>
                          updateAssignment(index, "dueDate", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={assignment.description}
                      onChange={(e) =>
                        updateAssignment(index, "description", e.target.value)
                      }
                      placeholder="Assignment description..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddModule}>Add Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Module Modal - Same as Add but with different handler */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>
              Update module content, resources, and assignments
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Same form structure as Add Modal */}
            <div className="space-y-2">
              <Label htmlFor="edit-module-title">Module Title *</Label>
              <Input
                id="edit-module-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-module-description">Description</Label>
              <Textarea
                id="edit-module-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            {/* Resources section - same as Add */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Resources</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addResource}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </div>

              {formData.resources.map((resource, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Resource {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResource(index)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={resource.type}
                        onValueChange={(value) =>
                          updateResource(index, "type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={resource.title}
                        onChange={(e) =>
                          updateResource(index, "title", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">URL</Label>
                    <Input
                      value={resource.url}
                      onChange={(e) =>
                        updateResource(index, "url", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Assignments section - same as Add */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Assignments</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAssignment}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assignment
                </Button>
              </div>

              {formData.assignments.map((assignment, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Assignment {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAssignment(index)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={assignment.title}
                        onChange={(e) =>
                          updateAssignment(index, "title", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Due Date</Label>
                      <Input
                        type="date"
                        value={assignment.dueDate?.split('T')[0] || assignment.dueDate}
                        onChange={(e) =>
                          updateAssignment(index, "dueDate", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={assignment.description}
                      onChange={(e) =>
                        updateAssignment(index, "description", e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
                setSelectedModuleIndex(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditModule}>Update Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Module
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{modules[selectedModuleIndex]?.title}"?
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove all module content</li>
                <li>Delete all resources and assignments</li>
                <li>Remove student progress for this module</li>
              </ul>
              <p className="mt-2 font-semibold text-destructive">
                This action cannot be undone.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedModuleIndex(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteModule}>
              Delete Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}