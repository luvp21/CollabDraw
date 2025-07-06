import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Users, Zap, Shield, Download, Smartphone, Globe, History } from "lucide-react"

const features = [
  {
    icon: <Palette className="w-8 h-8" />,
    title: "Professional Drawing Tools",
    description: "Complete set of drawing tools including shapes, brushes, text, and advanced styling options.",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Real-time Collaboration",
    description: "See changes instantly as your team draws together. Perfect for brainstorming and design reviews.",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Lightning Fast Performance",
    description: "Optimized rendering engine ensures smooth drawing experience even with complex illustrations.",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Secure & Private",
    description: "Your drawings are encrypted and stored securely. Control who can access your rooms.",
  },
  {
    icon: <Download className="w-8 h-8" />,
    title: "Export Anywhere",
    description: "Export your creations in multiple formats including PNG, SVG, and PDF.",
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Cross-Platform",
    description: "Works seamlessly across desktop, tablet, and mobile devices with touch support.",
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Infinite Canvas",
    description: "Unlimited drawing space with smooth panning and zooming. Never run out of room for your ideas.",
  },
  {
    icon: <History className="w-8 h-8" />,
    title: "Version History",
    description: "Track changes and revert to previous versions. Never lose your work with automatic saving.",
  },
]

export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to create amazing drawings
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed for teams and individuals who want to bring their ideas to life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
