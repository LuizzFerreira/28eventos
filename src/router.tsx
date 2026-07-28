import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const CreateEventPage = lazy(() => import('@/pages/dashboard/CreateEventPage'))
const EventPage = lazy(() => import('@/pages/dashboard/EventPage'))
const MessagesPage = lazy(() => import('@/pages/dashboard/MessagesPage'))
const NotificationsPage = lazy(() => import('@/pages/dashboard/NotificationsPage'))
const GuestsPage = lazy(() => import('@/pages/dashboard/GuestsPage'))
const FavoritesPage = lazy(() => import('@/pages/dashboard/FavoritesPage'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'))
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'))
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'))
const AdminClients = lazy(() => import('@/pages/admin/AdminClients'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function AppRouter() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/servicos" element={<ServicesPage />} />
          </Route>

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="criar-evento" element={<CreateEventPage />} />
            <Route path="evento" element={<EventPage />} />
            <Route path="mensagens" element={<MessagesPage />} />
            <Route path="notificacoes" element={<NotificationsPage />} />
            <Route path="convidados" element={<GuestsPage />} />
            <Route path="checklist" element={<EventPage />} />
            <Route path="favoritos" element={<FavoritesPage />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="eventos" element={<AdminEvents />} />
            <Route path="eventos/:id" element={<EventPage />} />
            <Route path="produtos" element={<AdminProducts />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="clientes" element={<AdminClients />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
