import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';

const Logbook = lazy(() => import('./views/Logbook').then((m) => ({ default: m.Logbook })));
const Diary = lazy(() => import('./views/Diary').then((m) => ({ default: m.Diary })));
const FilmWall = lazy(() => import('./views/FilmWall').then((m) => ({ default: m.FilmWall })));
const Stats = lazy(() => import('./views/Stats').then((m) => ({ default: m.Stats })));
const Profile = lazy(() => import('./views/Profile').then((m) => ({ default: m.Profile })));
const ProfileEdit = lazy(() => import('./views/ProfileEdit').then((m) => ({ default: m.ProfileEdit })));
const DayDetail = lazy(() => import('./views/DayDetail').then((m) => ({ default: m.DayDetail })));
const Settings = lazy(() => import('./views/Settings').then((m) => ({ default: m.Settings })));

const ViewLoadingSkeleton: React.FC = () => (
  <div className="space-y-4 max-w-4xl mx-auto animate-pulse">
    <div className="h-8 w-48 bg-theme-elevated rounded-xl" />
    <div className="h-40 w-full bg-theme-surface border border-theme-subtle rounded-2xl" />
    <div className="h-64 w-full bg-theme-surface border border-theme-subtle rounded-2xl" />
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route
            index
            element={
              <Suspense fallback={<ViewLoadingSkeleton />}>
                <Logbook />
              </Suspense>
            }
          />
          <Route
            path="diary"
            element={
              <Suspense fallback={<ViewLoadingSkeleton />}>
                <Diary />
              </Suspense>
            }
          />
          <Route
            path="day/:id"
            element={
              <Suspense fallback={<ViewLoadingSkeleton />}>
                <DayDetail />
              </Suspense>
            }
          />
          <Route
            path="films"
            element={
              <Suspense fallback={<ViewLoadingSkeleton />}>
                <FilmWall />
              </Suspense>
            }
          />
          <Route
            path="stats"
            element={
              <Suspense fallback={<ViewLoadingSkeleton />}>
                <Stats />
              </Suspense>
            }
          />
          <Route
            path="profile"
            element={
              <Suspense fallback={<ViewLoadingSkeleton />}>
                <Profile />
              </Suspense>
            }
          />
          <Route
            path="profile/edit"
            element={
              <Suspense fallback={<ViewLoadingSkeleton />}>
                <ProfileEdit />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<ViewLoadingSkeleton />}>
                <Settings />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
