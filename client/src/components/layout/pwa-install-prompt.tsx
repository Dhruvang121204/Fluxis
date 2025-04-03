import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Store the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (!isAppInstalled) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-16 inset-x-0 px-4 pb-4 sm:px-6 sm:pb-6 z-50">
      <div className="p-4 rounded-lg bg-primary text-white shadow-lg flex items-center justify-between">
        <div className="flex items-center">
          <Download className="h-6 w-6 mr-3" />
          <div>
            <p className="text-sm font-medium">Install Fluxis on your device</p>
            <p className="text-xs opacity-80">Use offline and get a better experience</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="text-white hover:bg-primary-foreground/10"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleInstallClick}
            className="bg-white text-primary hover:bg-white/90"
          >
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}