# Video Integration Checklist for React Testimonials Component

## Prerequisites
- [ ] Video files are available in the project assets directory
- [ ] React application is set up with Tailwind CSS
- [ ] Existing testimonials component is identified

## Step 1: Copy Video Assets
```bash
# Copy video files to React project assets directory
cp /path/to/sarah_c_before.mp4 /path/to/project/src/assets/
cp /path/to/sarah_c_during.mp4 /path/to/project/src/assets/
cp /path/to/david_m_before.mp4 /path/to/project/src/assets/
cp /path/to/david_m_during.mp4 /path/to/project/src/assets/
cp /path/to/emily_r_before.mp4 /path/to/project/src/assets/
cp /path/to/emily_r_during.mp4 /path/to/project/src/assets/
```

## Step 2: Import Video Assets in App.jsx
```javascript
// Add these imports at the top of App.jsx
import sarahBeforeVideo from '@/assets/sarah_c_before.mp4'
import sarahDuringVideo from '@/assets/sarah_c_during.mp4'
import davidBeforeVideo from '@/assets/david_m_before.mp4'
import davidDuringVideo from '@/assets/david_m_during.mp4'
import emilyBeforeVideo from '@/assets/emily_r_before.mp4'
import emilyDuringVideo from '@/assets/emily_r_during.mp4'
```

## Step 3: Update Testimonials Data Structure
```javascript
// Update the testimonials array to include video references
const testimonials = [
  {
    text: "Before, the phone was a constant source of anxiety...",
    author: "Sarah C.",
    role: "Office Manager, Dental Clinic",
    rating: 5,
    beforeVideo: sarahBeforeVideo,
    duringVideo: sarahDuringVideo,
    id: "sarah"
  },
  {
    text: "Growth was becoming a bottleneck...",
    author: "David M.",
    role: "Small Business Owner, Chiropractic Clinic", 
    rating: 5,
    beforeVideo: davidBeforeVideo,
    duringVideo: davidDuringVideo,
    id: "david"
  },
  {
    text: "I'm naturally skeptical of new tools...",
    author: "Emily R.",
    role: "Marketing Manager, E-commerce Company",
    rating: 5,
    beforeVideo: emilyBeforeVideo,
    duringVideo: emilyDuringVideo,
    id: "emily"
  }
]
```

## Step 4: Create Video Player Component
```javascript
// Add this component before the main App component
const VideoPlayer = ({ beforeVideo, duringVideo, isActive }) => {
  const [currentVideo, setCurrentVideo] = useState('before')
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const switchVideo = (type) => {
    setCurrentVideo(type)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  return (
    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={currentVideo === 'before' ? beforeVideo : duringVideo}
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Video Controls Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={toggleVideo}
          className="bg-white bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 transition-all"
        >
          {isPlaying ? (
            <div className="w-4 h-4 bg-gray-800"></div>
          ) : (
            <Play className="w-4 h-4 text-gray-800 ml-1" />
          )}
        </button>
      </div>

      {/* Video Type Selector */}
      <div className="absolute bottom-2 left-2 flex gap-1">
        <button
          onClick={() => switchVideo('before')}
          className={`px-2 py-1 text-xs rounded ${
            currentVideo === 'before' 
              ? 'bg-teal-600 text-white' 
              : 'bg-white bg-opacity-80 text-gray-800'
          }`}
        >
          Before
        </button>
        <button
          onClick={() => switchVideo('during')}
          className={`px-2 py-1 text-xs rounded ${
            currentVideo === 'during' 
              ? 'bg-teal-600 text-white' 
              : 'bg-white bg-opacity-80 text-gray-800'
          }`}
        >
          During
        </button>
      </div>
    </div>
  )
}
```

## Step 5: Add useRef Import
```javascript
// Update the React import to include useRef
import React, { useState, useEffect, useRef } from 'react'
```

## Step 6: Update Testimonials Section JSX
```javascript
// Replace the existing testimonials section with this enhanced version
<section id="testimonials" className="py-20 bg-gradient-to-br from-slate-50 to-teal-50">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
        Real Stories, Real Results
      </h2>
      <p className="text-xl text-slate-600 max-w-3xl mx-auto">
        See how MindForU has transformed businesses like yours
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <Card 
          key={index} 
          className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <CardContent className="p-6">
            {/* Video Player */}
            <VideoPlayer 
              beforeVideo={testimonial.beforeVideo}
              duringVideo={testimonial.duringVideo}
              isActive={activeTestimonial === index}
            />
            
            {/* Star Rating */}
            <div className="flex justify-center mb-4 mt-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            
            {/* Testimonial Text */}
            <p className="text-slate-600 mb-6 italic">
              "{testimonial.text}"
            </p>
            
            {/* Author Info */}
            <div className="text-center">
              <p className="font-semibold text-slate-900">{testimonial.author}</p>
              <p className="text-sm text-slate-500">{testimonial.role}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>
```

## Step 7: Test the Integration
```bash
# Start the development server
npm run dev

# Open browser and navigate to localhost:5173
# Verify that:
# - Videos load correctly
# - Play/pause controls work
# - Before/During toggle works
# - Videos are responsive
# - No console errors
```

## Step 8: Build and Deploy
```bash
# Build the application
npm run build

# Deploy using the deployment tool
# Verify the deployed version works correctly
```

## Troubleshooting Checklist
- [ ] Check that video files are in the correct assets directory
- [ ] Verify import paths are correct
- [ ] Ensure video file formats are supported (MP4 recommended)
- [ ] Check browser console for any errors
- [ ] Test on different devices and browsers
- [ ] Verify video controls are accessible
- [ ] Check that videos don't autoplay (for better UX)

## Optional Enhancements
- [ ] Add loading states for videos
- [ ] Implement video preloading
- [ ] Add keyboard controls for accessibility
- [ ] Include video captions/subtitles
- [ ] Add analytics tracking for video interactions
- [ ] Implement lazy loading for better performance

