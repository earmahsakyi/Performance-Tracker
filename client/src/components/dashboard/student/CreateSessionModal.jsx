import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDispatch } from 'react-redux'
import { createSession } from '../../../actions/groupChatAction'

const CreateSessionModal = ({ groupId, open, onClose }) => {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    description: '',
    type: 'Study Session',
    scheduledDate: '',
    duration: 60,
    meetingLink: '',
    agenda: []
  })

  const sessionTypes = ['Study Session', 'Workshop', 'Project Work', 'Discussion', 'Review', 'Presentation']

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createSession(groupId, formData))
      onClose()
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Study Session</DialogTitle>
          <DialogDescription>
            Schedule a new study session for your group
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic/Focus Area</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => handleChange('topic', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Date & Time</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingLink">Meeting Link (optional)</Label>
            <Input
              id="meetingLink"
              type="url"
              value={formData.meetingLink}
              onChange={(e) => handleChange('meetingLink', e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSessionModal