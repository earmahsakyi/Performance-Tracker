import { motion } from "framer-motion";
import { MessageSquare, Users, Trash2, Settings, Calendar } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { forumCategoriesData } from "./forumDummy";
import { DashboardLayout } from "./DashboardLayout";

export default function Forum() {

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
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </motion.div>

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
              <TableHead className="font-semibold">Moderators</TableHead>
              <TableHead className="font-semibold">Last Activity</TableHead>
              <TableHead className="font-semibold w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forumCategoriesData.map((category, index) => (
              <motion.tr
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                className="border-border hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-stats p-2 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{category.category}</div>
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
                    <span className="font-medium">{category.postsCount.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {category.moderators.map((moderator, i) => (
                      <div key={i} className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{moderator}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(category.lastActivity).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border border-border shadow-hover">
                      <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Category
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Moderators
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-muted text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
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
                {forumCategoriesData.reduce((acc, cat) => acc + cat.postsCount, 0).toLocaleString()}
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
                {forumCategoriesData.length}
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
              <p className="text-2xl font-bold text-foreground">127</p>
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
        Forum categories: {forumCategoriesData.length} • Total discussions: {forumCategoriesData.reduce((acc, cat) => acc + cat.postsCount, 0).toLocaleString()}
      </motion.div>
    </div>
    </DashboardLayout>
  );
}