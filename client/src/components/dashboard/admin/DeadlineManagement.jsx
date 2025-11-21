import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Clock,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import {
  fetchDeadlineByCourseId,
  createDeadline,
  updateDeadline,
  deleteDeadline,
} from "../../../actions/deadlineAction";

export default function DeadlineManagement({ course, isOpen, onClose }) {
  const dispatch = useDispatch();

  // Local state
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    priority: "Medium",
  });

  // Load deadlines when modal opens
  useEffect(() => {
    if (isOpen && course) {
      loadDeadlines();
    }
  }, [isOpen, course]);

  // Load deadlines for the course
  const loadDeadlines = async () => {
    setLoading(true);
    try {
      // You might need to adjust this based on your API
      // For now, we'll filter deadlines by courseId
      const result = await dispatch(fetchDeadlineByCourseId(course._id));
        
      if (result?.success) {
        setDeadlines(result?.data);
      }
    } catch (error) {
      toast.error("Failed to load deadlines", {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      priority: "Medium",
    });
  };

  // Handle create deadline
  const handleCreateDeadline = async () => {
    if (!formData.title || !formData.date) {
      toast.error("Title and Date are required", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    try {
      const deadlineData = {
        ...formData,
        courseId: course._id,
        courseName: course.title,
      };

      const res = await dispatch(createDeadline(deadlineData));
      if (res?.success){
        toast.success("Deadline created successfully", {
        duration: 3000,
        position: "top-right",
      });
      setShowCreateDialog(false);
      resetForm();
      loadDeadlines();
      }
      
    } catch (error) {
      toast.error(error, {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  // Handle edit deadline
  const handleEditDeadline = async () => {
    if (!formData.title || !formData.date) {
      toast.error("Title and Date are required", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    try {
      const deadlineData = {
        ...formData,
        courseId: course._id,
        courseName: course.title,
      };

      await dispatch(updateDeadline(selectedDeadline._id, deadlineData));
      toast.success("Deadline updated successfully", {
        duration: 3000,
        position: "top-right",
      });
      setShowEditDialog(false);
      setSelectedDeadline(null);
      resetForm();
      loadDeadlines();
    } catch (error) {
      toast.error("Failed to update deadline", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  // Handle delete deadline
  const handleDeleteDeadline = async () => {
    try {
      await dispatch(deleteDeadline(selectedDeadline._id));
      toast.success("Deadline deleted successfully", {
        duration: 3000,
        position: "top-right",
      });
      setShowDeleteDialog(false);
      setSelectedDeadline(null);
      loadDeadlines();
    } catch (error) {
      toast.error("Failed to delete deadline", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (deadline) => {
    setSelectedDeadline(deadline);
    setFormData({
      title: deadline.title || "",
      description: deadline.description || "",
      date: deadline.date ? deadline.date.split("T")[0] : "",
      priority: deadline.priority || "Medium",
    });
    setShowEditDialog(true);
  };

  // Open delete dialog
  const openDeleteDialog = (deadline) => {
    setSelectedDeadline(deadline);
    setShowDeleteDialog(true);
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    const colors = {
      High: "bg-red-500/10 text-red-500 border-red-500/20",
      Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      Low: "bg-green-500/10 text-green-500 border-green-500/20",
    };
    return colors[priority] || colors.Medium;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if deadline is upcoming
  const isUpcoming = (dateString) => {
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  return (
    <>
      {/* Main Deadline Management Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Manage Deadlines
            </DialogTitle>
            <DialogDescription>
              {course?.title} ({course?.code})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {deadlines.length} deadline(s) for this course
              </div>
              <Button
                onClick={() => setShowCreateDialog(true)}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Deadline
              </Button>
            </div>

            {/* Deadlines List */}
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : deadlines.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No deadlines set for this course yet.
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Deadline
                </Button>
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deadlines.map((deadline, index) => (
                      <motion.tr
                        key={deadline._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-border hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">
                              {deadline.title}
                            </div>
                            {deadline.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {deadline.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(deadline.date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getPriorityColor(deadline.priority)}
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            {deadline.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isUpcoming(deadline.date) ? (
                            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                              Upcoming
                            </Badge>
                          ) : new Date(deadline.date) < new Date() ? (
                            <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                              Past
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              Future
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(deadline)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(deadline)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Deadline Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Deadline</DialogTitle>
            <DialogDescription>
              Add a new deadline for {course?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Assignment 1 Submission"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Additional details about this deadline..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Due Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateDeadline}>Create Deadline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Deadline Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Deadline</DialogTitle>
            <DialogDescription>Update deadline information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Due Date *</Label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedDeadline(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditDeadline}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Deadline
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDeadline?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedDeadline(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDeadline}>
              Delete Deadline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}