
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  BarChart3, 
  Download, 
  Upload, 
  Filter, 
  Zap, 
  Shield, 
  Cloud,
  PieChart,
  TrendingUp,
  Database,
  RefreshCw
} from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Upload,
      title: "Smart Data Import",
      description: "Upload Excel files with automatic data validation, type detection, and error handling",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: BarChart3,
      title: "3D Chart Generation",
      description: "Create stunning 3D visualizations with interactive controls and animation effects",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Download,
      title: "Export & Download",
      description: "Download charts as images, PDFs, or export processed data back to Excel format",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Filter,
      title: "Advanced Filtering",
      description: "Apply complex filters, sorting, and data transformations with visual interface",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Live data processing with instant chart updates and trend analysis",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Organize, version, and manage your Excel files with cloud storage integration",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: PieChart,
      title: "Multiple Chart Types",
      description: "Support for 2D/3D bar charts, pie charts, line graphs, and custom visualizations",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: RefreshCw,
      title: "Auto-Sync",
      description: "Automatically sync with your Excel files and update charts when data changes",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, secure data processing, and compliance with data regulations",
      color: "from-red-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            ✨ Powerful Features
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Excel Analytics</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive tools designed to transform your Excel data into actionable insights 
            with professional-grade visualizations and analytics capabilities.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Advanced Analytics Tools
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Professional-grade features for complex data analysis and reporting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <Cloud className="h-8 w-8 text-white mr-3" />
                <h3 className="text-xl font-semibold text-white">Cloud Integration</h3>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Seamlessly connect with cloud storage providers like Google Drive, Dropbox, and OneDrive. 
                Automatically sync your Excel files and keep your analytics up-to-date.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <Zap className="h-8 w-8 text-white mr-3" />
                <h3 className="text-xl font-semibold text-white">Lightning Fast</h3>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Process large Excel files in seconds with our optimized data processing engine. 
                Handle millions of rows without compromising on performance or visualization quality.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
