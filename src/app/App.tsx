import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, RoleProtectedRoute } from '@/components/common/ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { AIAlertsPage } from '@/pages/ai/AIAlertsPage';
import { AIInsightsPage } from '@/pages/ai/AIInsightsPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { OrganizationDashboardPage } from '@/pages/dashboard/OrganizationDashboardPage';
import { UserDashboardPage } from '@/pages/dashboard/UserDashboardPage';
import { DonationDetailsPage } from '@/pages/donations/DonationDetailsPage';
import { EditDonationPage } from '@/pages/donations/EditDonationPage';
import { DonationFeedPage } from '@/pages/donations/DonationFeedPage';
import { CreateDonationPage } from '@/pages/donations/CreateDonationPage';
import { EventDetailsPage } from '@/pages/events/EventDetailsPage';
import { EventsListPage } from '@/pages/events/EventsListPage';
import { CreateEventPage } from '@/pages/events/CreateEventPage';
import { EditEventPage } from '@/pages/events/EditEventPage';
import { HomePage } from '@/pages/HomePage';
import { MapPage } from '@/pages/MapPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ChatPage } from '@/pages/ChatPage';
import { RequestDetailsPage } from '@/pages/requests/RequestDetailsPage';
import { EditRequestPage } from '@/pages/requests/EditRequestPage';
import { RequestsFeedPage } from '@/pages/requests/RequestsFeedPage';
import { CreateRequestPage } from '@/pages/requests/CreateRequestPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/shared/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/donations/feed" element={<DonationFeedPage />} />
          <Route path="/donations/:id" element={<DonationDetailsPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/donations/:id/edit" element={<EditDonationPage />} />
          </Route>
          <Route path="/requests" element={<RequestsFeedPage />} />
          <Route path="/requests/:id" element={<RequestDetailsPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/requests/:id/edit" element={<EditRequestPage />} />
          </Route>
          <Route path="/events" element={<EventsListPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />

          <Route element={<ProtectedRoute allowBeforeOnboarding />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />

              <Route element={<RoleProtectedRoute allowedRoles={['user']} />}>
                <Route path="/dashboard/user" element={<UserDashboardPage />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['organization']} />}>
                <Route path="/dashboard/org" element={<OrganizationDashboardPage />} />
                <Route path="/ai/insights" element={<AIInsightsPage />} />
                <Route path="/ai/alerts" element={<AIAlertsPage />} />
              </Route>
            </Route>

            <Route path="/requests/new" element={<CreateRequestPage />} />
            <Route path="/donations/new" element={<CreateDonationPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route element={<RoleProtectedRoute allowedRoles={['organization']} />}>
              <Route path="/events/new" element={<CreateEventPage />} />
              <Route path="/events/:id/edit" element={<EditEventPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
