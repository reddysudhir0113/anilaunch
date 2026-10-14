/**
 * Main Application Component for AniLaunch
 */

import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimeProvider, useAnime } from './context/AnimeContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import NotificationCenter from './components/NotificationCenter';
import Toast from './components/Toast';
import AnimeForm from './components/AnimeForm';
import ConfirmDialog from './components/ConfirmDialog';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import MyAnime from './pages/MyAnime';
import AnimeDetails from './pages/AnimeDetails';
import Upcoming from './pages/Upcoming';
import Calendar from './pages/Calendar';
import Completed from './pages/Completed';
import Settings from './pages/Settings';

function AppLayout() {
  const location = useLocation();
  const { addAnime, updateAnime, deleteAnime } = useAnime();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);

  const isLandingPage = location.pathname === '/';

  const handleOpenAddModal = () => {
    setEditingAnime(null);
    setIsAddModalOpen(true);
  };

  const handleEditAnime = (anime) => {
    setEditingAnime(anime);
    setIsAddModalOpen(true);
  };

  const handleDeleteRequest = (id) => {
    setDeleteCandidateId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteCandidateId) {
      await deleteAnime(deleteCandidateId);
      setDeleteCandidateId(null);
    }
  };

  const handleFormSubmit = (animeData) => {
    if (editingAnime) {
      updateAnime(editingAnime.id, animeData);
    } else {
      addAnime(animeData);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] text-slate-800 flex flex-col font-sans">
      {/* Global Animated Toasts */}
      <Toast />

      {/* Global Notification Center Slide-over */}
      <NotificationCenter
        isOpen={isNotifCenterOpen}
        onClose={() => setIsNotifCenterOpen(false)}
      />

      {/* Global Add / Edit Anime Modal */}
      <AnimeForm
        isOpen={isAddModalOpen}
        initialData={editingAnime}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAnime(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Global Confirm Delete Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteCandidateId)}
        title="Delete Anime Mission?"
        message="Are you sure you want to delete this anime? Its tracked progress and cached IndexedDB poster image will be permanently removed."
        confirmText="Delete Anime"
        cancelText="Keep"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidateId(null)}
      />

      {/* Landing Page (Full Width Immersive) vs Dashboard App Shell */}
      {isLandingPage ? (
        <div className="w-full min-h-screen">
          <Routes>
            <Route path="/" element={<Landing />} />
          </Routes>
        </div>
      ) : (
        <div className="flex w-full min-h-screen">
          {/* Desktop Glass Sidebar */}
          <Sidebar />

          {/* Main App Content Deck */}
          <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
            <Navbar
              onOpenAddModal={handleOpenAddModal}
              onToggleNotificationCenter={() => setIsNotifCenterOpen((prev) => !prev)}
            />

            <main className="flex-1">
              <Routes>
                <Route
                  path="/dashboard"
                  element={<Dashboard onOpenAddModal={handleOpenAddModal} />}
                />
                <Route
                  path="/anime"
                  element={
                    <MyAnime
                      onOpenAddModal={handleOpenAddModal}
                      onEditAnime={handleEditAnime}
                      onDeleteAnime={handleDeleteRequest}
                    />
                  }
                />
                <Route
                  path="/anime/:id"
                  element={
                    <AnimeDetails
                      onEditAnime={handleEditAnime}
                      onDeleteAnime={handleDeleteRequest}
                    />
                  }
                />
                <Route
                  path="/upcoming"
                  element={<Upcoming onOpenAddModal={handleOpenAddModal} />}
                />
                <Route
                  path="/calendar"
                  element={<Calendar onOpenAddModal={handleOpenAddModal} />}
                />
                <Route
                  path="/completed"
                  element={
                    <Completed
                      onEditAnime={handleEditAnime}
                      onDeleteAnime={handleDeleteRequest}
                    />
                  }
                />
                <Route path="/settings" element={<Settings />} />
                {/* Fallback */}
                <Route
                  path="*"
                  element={<Dashboard onOpenAddModal={handleOpenAddModal} />}
                />
              </Routes>
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AnimeProvider>
        <NotificationProvider>
          <AppLayout />
        </NotificationProvider>
      </AnimeProvider>
    </HashRouter>
  );
}
