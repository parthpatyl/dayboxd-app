import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { DesktopNav, MobileTabBar } from './Navigation';
import { TicketModal } from '../export/TicketModal';
import { ToastContainer } from '../ui/Toast';
import { SplashScreen } from '../ui/SplashScreen';
import { useStore } from '../../store/useStore';
import { useUI } from '../../store/useUI';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const Shell: React.FC = () => {
  const { init, isInitialized } = useStore();
  const { ticketModalDayId, closeTicketModal, lightboxImageUrl, closeLightbox } = useUI();
  const [splashFinished, setSplashFinished] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    init();
  }, [init]);

  // Android Hardware / Gesture Back Button Reverse Tracking
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backButtonHandler = CapacitorApp.addListener('backButton', () => {
      // 1. If modals are open, close them first
      if (ticketModalDayId) {
        closeTicketModal();
        return;
      }
      if (lightboxImageUrl) {
        closeLightbox();
        return;
      }

      // 2. If on sub-route (e.g. /diary, /profile/edit, /stats), navigate backwards
      if (location.pathname !== '/') {
        navigate(-1);
        return;
      }

      // 3. If at root '/', minimize or exit app
      CapacitorApp.exitApp();
    });

    return () => {
      backButtonHandler.then((h) => h.remove());
    };
  }, [ticketModalDayId, lightboxImageUrl, location.pathname, navigate, closeTicketModal, closeLightbox]);

  if (!isInitialized || !splashFinished) {
    return <SplashScreen onComplete={() => setSplashFinished(true)} />;
  }

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary flex flex-col antialiased selection:bg-white selection:text-black">
      <Header />
      <DesktopNav />

      {/* Main Content Area with guaranteed un-overridden margins on all screens */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 py-5 sm:py-7 pb-36 sm:pb-24">
        <Outlet />
      </main>

      <MobileTabBar />
      <TicketModal />
      <ToastContainer />
    </div>
  );
};
