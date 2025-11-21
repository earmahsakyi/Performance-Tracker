import React from 'react'
import { motion } from "framer-motion";
import { MessageSquare, Users, Trash2, Settings, Calendar, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "./DashboardLayout";
import { CategoryModal } from "./CategoryModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { useSelector, useDispatch } from 'react-redux';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getForumAnalytics 
} from '../../../actions/adminForumAction';

export default function Forum() {
  const dispatch = useDispatch();
  const { categories, loading, error, analytics } = useSelector(state => state.adminForum);
  
  const [categoryModal, setCategoryModal] = React.useState({
    isOpen: false,
    mode: 'create',
    category: null
  });
  
  const [deleteModal, setDeleteModal] = React.useState({
    isOpen: false,
    category: null
  });

  const [actionLoading, setActionLoading] = React.useState(false);

  React.useEffect(() => {
    dispatch(getCategories());
    dispatch(getForumAnalytics());
  }, [dispatch]);

  const handleCreateCategory = async (formData) => {
    setActionLoading(true);
    const result = await dispatch(createCategory(formData));
    setActionLoading(false);
    
    if (result?.success) {
      dispatch(getCategories());
    }
  };

  const handleUpdateCategory = async (formData) => {
    setActionLoading(true);
    const result = await dispatch(updateCategory(categoryModal.category._id, formData));
    setActionLoading(false);
    
    if (result.success) {
      dispatch(getCategories()); // Refresh the list
    }
  };

  const handleDeleteCategory = async () => {
    setActionLoading(true);
    const result = await dispatch(deleteCategory(deleteModal.category._id));
    setActionLoading(false);
    
    if (result.success) {
      setDeleteModal({ isOpen: false, category: null });
      dispatch(getCategories()); // Refresh the list
    }
  };

  const openCreateModal = () => {
    setCategoryModal({
      isOpen: true,
      mode: 'create',
      category: null
    });
  };

  const openEditModal = (category) => {
    setCategoryModal({
      isOpen: true,
      mode: 'edit',
      category
    });
  };

  const openDeleteModal = (category) => {
    setDeleteModal({
      isOpen: true,
      category
    });
  };

  const closeModals = () => {
    setCategoryModal({ isOpen: false, mode: 'create', category: null });
    setDeleteModal({ isOpen: false, category: null });
  };

  const getCategoryIcon = (iconName) => {
    const icons = {
      MessageSquare: MessageSquare,
      Users: Users,
      Calendar: Calendar,
      // Add more icons as needed
    };
    return icons[iconName] || MessageSquare;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Forum Management</h1>
            <p className="text-muted-foreground">
              Manage forum categories and moderate discussions
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={openCreateModal}
            disabled={loading}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Forum Categories Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card rounded-lg shadow-card border border-border overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Posts</TableHead>
                <TableHead className="font-semibold">Settings</TableHead>
                <TableHead className="font-semibold">Last Activity</TableHead>
                <TableHead className="font-semibold w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No categories found. Create your first category to get started.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => {
                  const IconComponent = getCategoryIcon(category.icon);
                  return (
                    <motion.tr
                      key={category._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                      className="border-border hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent 
                              className="h-4 w-4" 
                              style={{ color: category.color.replace('bg-', '') }}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{category.name}</div>
                            <div className="text-xs text-muted-foreground">/{category.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-md">
                          {category.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{category.postsCount?.toLocaleString() || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">Moderation:</span>
                            <span className={category.requiresModeration ? "text-amber-500" : "text-green-500"}>
                              {category.requiresModeration ? "Required" : "Not Required"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">Students:</span>
                            <span className={category.allowStudentPosts ? "text-green-500" : "text-red-500"}>
                              {category.allowStudentPosts ? "Allowed" : "Not Allowed"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(category.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border border-border shadow-hover">
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => openEditModal(category)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                              <Users className="h-4 w-4 mr-2" />
                              Manage Moderators
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-muted text-destructive"
                              onClick={() => openDeleteModal(category)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </motion.div>

        {/* Forum Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-card p-6 rounded-lg shadow-card border border-border">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-stats p-3 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.overview?.totalPosts?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-card border border-border">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-stats p-3 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-foreground">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-card border border-border">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-stats p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.overview?.newPosts || '0'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="text-sm text-muted-foreground"
        >
          Forum categories: {categories.length} • Total discussions: {analytics?.overview?.totalPosts?.toLocaleString() || '0'}
        </motion.div>
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={categoryModal.isOpen}
        onClose={closeModals}
        onSubmit={categoryModal.mode === 'create' ? handleCreateCategory : handleUpdateCategory}
        category={categoryModal.category}
        mode={categoryModal.mode}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeModals}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteModal.category?.name}"? This action cannot be undone.`}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
}