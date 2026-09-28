// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";

import EventProgramPage from "./pages/Events/Event";
import CreateEvents from "./pages/Events/CreateEvents";
import ShowEvent from "./pages/Events/ShowEvent";
import EditEvent from "./pages/Events/EditEvent";
import DeleteEvent from "./pages/Events/DeleteEvent";

import EventView from "./pages/Events/EventView";
import AddEventParticipents from "./pages/Events/AddEventParticipents";
import EventBookingList from "./pages/Events/EventBookingList";
import EditEventBooking from "./pages/Events/EditEventBooking";
import DeleteEventBooking from "./pages/Events/DeleteEventBooking";

import AdminLogin from "./pages/AdminLogin";
import OAuthCallback from "./pages/OAuthCallback";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/AdminDashboard";
import AdminsPage from "./pages/AdminsPage";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the ProtectedRoute component

import ShowFAQ from "./pages/Help Desk and FAQ/ShowFAQ";
import CreateTickets from "./pages/Help Desk and FAQ/createTicket";
import ViewTickets from "./pages/Help Desk and FAQ/viewTickets";
import FaqDashboard from "./pages/Help Desk and FAQ/faqDashboard";

import CreateMembershipPack from "./pages/Memberships/CreateMembershipPack";
import ViewMembershipPacks from "./pages/Memberships/ViewMembershipPacks";
import DeleteMembershipPack from "./pages/Memberships/DeleteMembershipPack";
import ShowMembershipPack from "./pages/Memberships/ShowMembershipPack";
import UpdateMembershipPack from "./pages/Memberships/UpdateMembershipPack";
import SubscribePage from "./pages/Memberships/SubscribingPage";
import ViewAvailablePacks from "./pages/Memberships/ViewAvailablePacks";
import ViewSubscription from "./pages/Memberships/ViewSubscription";
import ViewSubscriptions from "./pages/Memberships/ViewAllSubscriptions";
import ViewPaymentSlip from "./pages/Memberships/ViewPaymentSlip";

import Product from "./pages/Products/Product";
import CreateProducts from "./pages/Products/CreateProducts";
import DeleteProduct from "./pages/Products/DeleteProduct";
import EditProduct from "./pages/Products/EditProduct";
import ShowProduct from "./pages/Products/ShowProduct";

import LandingPage from "./pages/Products/LandingPage";
import ProductView from "./pages/Products/ProductUser";
import ProductDetails from "./pages/Products/PurchaseForm";
import PurchaseList from "./pages/Products/PurchaseList";
import EditPurchase from "./pages/Products/EditPurchase";
import DeletePurchase from "./pages/Products/DeletePurchase";

import RefundPage from "./pages/Refund/RefundPage";
import CreateRefund from "./pages/Refund/CreateRefund";
import EditRefund from "./pages/Refund/EditRefund";
import DeleteRefund from "./pages/Refund/DeleteRefund";
import ShowRefund from "./pages/Refund/ShowRefund";
import UserRefunds from "./pages/Refund/RefundUserPage";
import RefundLandingPage from "./pages/Refund/RefundLandingPage";

import HomeDonation from "./pages/Donation/HomeDonation";
import CreateDonations from "./pages/Donation/CreateDonations";
import ShowDonation from "./pages/Donation/ShowDonation";
import EditDonation from "./pages/Donation/EditDonation";
import DeleteDonation from "./pages/Donation/DeleteDonation";
import HeroSection from "./pages/Donation/HeroSection";

import CreateReturns from "./pages/Return Products/CreateReturn";
import DeleteReturn from "./pages/Return Products/DeleteReturn";
import EditReturn from "./pages/Return Products/EditReturn";
import ReturnProduct from "./pages/Return Products/ReturnProduct";
import ShowReturn from "./pages/Return Products/ShowReturn";

import EventLanding from "./pages/Events/EventLanding";
import Footer from "./components/Footer";

import TurtleGame from "./pages/Events/TurtleGame";

import SaveMePage from "./pages/SaveMePage";

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/oauth-callback" element={<OAuthCallback />} />
        <Route
          path="/admin/register"
          element={
            <ProtectedRoute>
              <AdminRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/admins"
          element={
            <ProtectedRoute>
              <AdminsPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Routes>
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventProgramPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/create"
          element={
            <ProtectedRoute>
              <CreateEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/details/:id"
          element={
            <ProtectedRoute>
              <ShowEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/edit/:id"
          element={
            <ProtectedRoute>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/delete/:id"
          element={
            <ProtectedRoute>
              <DeleteEvent />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Routes>
        <Route path="/eventViews" element={<EventView />} />
        <Route
          path="/eventViews/eventParticipants"
          element={<AddEventParticipents />}
        />
        <Route
          path="/eventBookingList"
          element={
            <ProtectedRoute>
              <EventBookingList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sendEmail"
          element={
            <ProtectedRoute>
              <EventBookingList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eventBookingList/edit/:id"
          element={
            <ProtectedRoute>
              <EditEventBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eventBookingList/delete/:id"
          element={
            <ProtectedRoute>
              <DeleteEventBooking />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>

      {/* Hariri */}
      <Routes>
        <Route path="/createtickets" element={<CreateTickets />} />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <ViewTickets />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Routes>
        <Route path="/faq" element={<ShowFAQ />} />
        <Route
          path="/faqdashboard"
          element={
            <ProtectedRoute>
              <FaqDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Shermon */}
      <Routes>
        <Route
          path="/membership/packagecreate"
          element={
            <ProtectedRoute>
              <CreateMembershipPack />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership/packageupdate/:id"
          element={
            <ProtectedRoute>
              <UpdateMembershipPack />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership/packagedelete/:id"
          element={
            <ProtectedRoute>
              <DeleteMembershipPack />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership/view"
          element={
            <ProtectedRoute>
              <ViewMembershipPacks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions/subscriptions"
          element={
            <ProtectedRoute>
              <ViewSubscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership/details/:id"
          element={
            <ProtectedRoute>
              <ShowMembershipPack />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ViewAvailablePacks/viewpacks"
          element={<ViewAvailablePacks />}
        />
        <Route
          path="subscriptions/:id/payment-slip"
          element={<ViewPaymentSlip />}
        />
        <Route path="/subscribe/:id" element={<SubscribePage />} />
        <Route path="/subscriptions/:id" element={<ViewSubscription />} />
      </Routes>

      {/* Farthas */}
      <Routes>
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/create"
          element={
            <ProtectedRoute>
              <CreateProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/details/:id"
          element={
            <ProtectedRoute>
              <ShowProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/edit/:id"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/delete/:id"
          element={
            <ProtectedRoute>
              <DeleteProduct />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Routes>
        <Route path="/saveMes/*" element={<SaveMePage />} />
      </Routes>

      <Routes>
        <Route path="/shop" element={<LandingPage />} />
        <Route path="/productViews" element={<ProductView />} />
        <Route path="/productViews/purchaseForm" element={<ProductDetails />} />
        <Route
          path="/purchaseList"
          element={
            <ProtectedRoute>
              <PurchaseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sendEmail"
          element={
            <ProtectedRoute>
              <PurchaseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchaseList/edit/:id"
          element={
            <ProtectedRoute>
              <EditPurchase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchaseList/delete/:id"
          element={
            <ProtectedRoute>
              <DeletePurchase />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Azmath */}
      <Routes>
        <Route path="/refundLanding" element={<RefundLandingPage />}></Route>
        <Route path="/userRefunds" element={<UserRefunds />}></Route>
      </Routes>
      <Routes>
        <Route
          path="/refunds"
          element={
            <ProtectedRoute>
              <RefundPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/refunds/create"
          element={
            <ProtectedRoute>
              <CreateRefund />
            </ProtectedRoute>
          }
        />
        <Route
          path="/refunds/details/:id"
          element={
            <ProtectedRoute>
              <ShowRefund />
            </ProtectedRoute>
          }
        />
        <Route
          path="/refunds/edit/:id"
          element={
            <ProtectedRoute>
              <EditRefund />
            </ProtectedRoute>
          }
        />
        <Route
          path="/refunds/delete/:id"
          element={
            <ProtectedRoute>
              <DeleteRefund />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Donation */}

      <Routes>
        <Route
          path="/donations"
          element={
            <ProtectedRoute>
              <HomeDonation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donations/details/:id"
          element={
            <ProtectedRoute>
              <ShowDonation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donations/edit/:id"
          element={
            <ProtectedRoute>
              <EditDonation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donations/delete/:id"
          element={
            <ProtectedRoute>
              <DeleteDonation />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Routes>
        <Route path="/donations/herosection" element={<HeroSection />} />
        <Route path="/donations/create" element={<CreateDonations />} />
      </Routes>

      <Routes>
        <Route
          path="/returns"
          element={
            <ProtectedRoute>
              <ReturnProduct />
            </ProtectedRoute>
          }
        />
        <Route path="/returns/create" element={<CreateReturns />} />
        <Route
          path="/returns/details/:id"
          element={
            <ProtectedRoute>
              <ShowReturn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/returns/edit/:id"
          element={
            <ProtectedRoute>
              <EditReturn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/returns/delete/:id"
          element={
            <ProtectedRoute>
              <DeleteReturn />
            </ProtectedRoute>
          }
        />
        <Route path="/game" element={<TurtleGame />} />
      </Routes>

      <Routes>
        <Route path="/eventlanding" element={<EventLanding />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
