import { motion } from "framer-motion"


export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  index 
}) {
  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="bg-gradient-card p-6 rounded-lg shadow-stats border border-border hover:shadow-hover transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm font-medium mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground mb-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={`text-sm ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        
        <div className="ml-4">
          <div className="bg-gradient-stats p-3 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
