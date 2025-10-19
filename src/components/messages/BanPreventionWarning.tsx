'use client';

import { useState } from 'react';
import { 
  ExclamationTriangleIcon, 
  XMarkIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export function BanPreventionWarning() {
  const [isVisible, setIsVisible] = useState(true);
  const [showFullGuide, setShowFullGuide] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900">
              ⚠️ WhatsApp Ban Prevention Guide
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Read this before sending messages to avoid permanent account ban!
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Safety Features */}
        <div className="bg-white rounded-md p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <ShieldCheckIcon className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">✅ App Safety Features</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span><strong>400+ spam words</strong> auto-detected & removed</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span><strong>AI personalization</strong> - unique message per contact</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span><strong>Smart rate limiting</strong> - max 50/min, 1000/hour</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span><strong>Spam score</strong> - only send if &lt; 40</span>
            </li>
          </ul>
        </div>

        {/* Critical Rules */}
        <div className="bg-white rounded-md p-4 border border-red-200">
          <div className="flex items-center space-x-2 mb-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-gray-900">❌ NEVER Do This</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-red-600 mr-2">•</span>
              <span>Use words: URGENT, BUY NOW, LIMITED TIME</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-2">•</span>
              <span>Send same message to everyone</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-2">•</span>
              <span>Use delays less than 60 seconds</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-2">•</span>
              <span>Skip AI analysis before sending</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Critical Actions */}
      <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-md p-4">
        <h4 className="font-semibold text-yellow-900 mb-3">🎯 5 Golden Rules to Stay Safe:</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-4 w-4 text-purple-600 flex-shrink-0" />
            <span className="text-gray-800"><strong>1. Analyze First</strong><br/>Always use AI check</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-gray-800"><strong>2. Slow Down</strong><br/>60s+ delay</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-800"><strong>3. Personalize</strong><br/>Unique messages</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-4 w-4 text-indigo-600 flex-shrink-0" />
            <span className="text-gray-800"><strong>4. Professional</strong><br/>No spam words</span>
          </div>
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-orange-600 flex-shrink-0" />
            <span className="text-gray-800"><strong>5. Test Small</strong><br/>5-10 contacts first</span>
          </div>
        </div>
      </div>

      {/* Expandable Full Guide */}
      {showFullGuide && (
        <div className="mt-4 bg-white border border-gray-300 rounded-md p-4 max-h-96 overflow-y-auto">
          <h4 className="font-bold text-gray-900 mb-3">📚 Complete Ban Prevention Guide</h4>
          
          {/* Spam Score Reference */}
          <div className="mb-4">
            <h5 className="font-semibold text-gray-800 mb-2">📊 Spam Score Reference:</h5>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span>0-20: Safe</span>
                <span className="badge badge-success">✅ Send Now</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span>21-40: Low Risk</span>
                <span className="badge badge-success">✅ Safe to Send</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span>41-60: Medium Risk</span>
                <span className="badge badge-warning">⚠️ Rewrite First</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <span>61-80: High Risk</span>
                <span className="badge badge-error">🚨 Don't Send</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span>81-100: Critical</span>
                <span className="badge badge-error">🔴 Never Send</span>
              </div>
            </div>
          </div>

          {/* Words to Avoid */}
          <div className="mb-4">
            <h5 className="font-semibold text-gray-800 mb-2">🚫 Top Banned Words:</h5>
            <div className="flex flex-wrap gap-2">
              {['URGENT', 'Buy Now', 'Limited Time', 'Free Money', 'Click Here', 'Guaranteed', 
                'Congratulations', 'You Won', 'Amazing', 'Last Chance', 'Call Now', 'Act Now'].map((word, i) => (
                <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  {word}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              ✅ Our AI automatically removes these from your messages
            </p>
          </div>

          {/* Safe Delays */}
          <div className="mb-4">
            <h5 className="font-semibold text-gray-800 mb-2">⏱️ Recommended Delays:</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <strong>10-100 contacts:</strong> 60s delay
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>100-500 contacts:</strong> 90s delay
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>500-1000 contacts:</strong> 120s delay
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>1000+ contacts:</strong> Split batches
              </div>
            </div>
          </div>

          {/* Warning Signs */}
          <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
            <h5 className="font-semibold text-red-900 mb-2">🚨 Stop Sending If You See:</h5>
            <ul className="space-y-1 text-sm text-red-800">
              <li>• Messages not delivering (single tick for long time)</li>
              <li>• "Message not sent" errors appearing</li>
              <li>• Recipients reporting you as spam</li>
              <li>• WhatsApp temporary ban message</li>
              <li>• Account under review notification</li>
            </ul>
          </div>

          {/* Best Practices */}
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">💡 Best Practices:</h5>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Send during business hours (9 AM - 6 PM)
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Keep messages under 500 characters
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Use recipient's name naturally (1-2 times)
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Provide genuine value in your message
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Only message people who know you
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Always test with 5-10 contacts first
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setShowFullGuide(!showFullGuide)}
          className="text-sm font-medium text-red-700 hover:text-red-900 underline"
        >
          {showFullGuide ? '▲ Hide Full Guide' : '▼ Show Full Guide'}
        </button>
        <div className="flex items-center space-x-4">
          <a
            href="/AVOID_WHATSAPP_BAN.md"
            target="_blank"
            className="text-sm font-medium text-blue-700 hover:text-blue-900 underline"
          >
            📚 Read Complete Documentation
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            ✓ I Understand, Don't Show Again
          </button>
        </div>
      </div>

      {/* Critical Warning */}
      <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
        <p className="text-sm font-bold text-red-900 text-center">
          ⚠️ WhatsApp bans are PERMANENT and IRREVERSIBLE! Always use AI analysis before sending. ⚠️
        </p>
      </div>
    </div>
  );
}

export default BanPreventionWarning;

