import axios from "axios";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";

const getKhaltiBaseUrl = () =>
  process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";

const getFrontendUrl = (req) =>
  process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";

const getKhaltiSecretKey = () => process.env.KHALTI_SECRET_KEY;

const updateBookingPayment = async ({ bookingId, amount, pidx, payload }) => {
  const existingPayment = await Payment.findOne({ pidx });
  if (existingPayment) {
    return Booking.findById(bookingId);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) return null;

  const totalPrice = Number(booking.totalPrice) || 0;
  const paymentAmount = Number(amount) / 100;
  const nextAdvancePaid = Math.min(
    Number(booking.advancePaid || 0) + paymentAmount,
    totalPrice
  );

  booking.advancePaid = nextAdvancePaid;
  booking.paymentStatus =
    nextAdvancePaid >= totalPrice
      ? "paid"
      : nextAdvancePaid > 0
      ? "partial"
      : "pending";

  await booking.save();
  await Payment.create({
    userId: booking.user,
    bookingId,
    amount: paymentAmount,
    pidx,
    status: payload?.status || "Completed",
    payload,
  });

  return booking;
};

export const initiateKhaltiPaymentController = async (req, res) => {
  try {
    const secretKey = getKhaltiSecretKey();
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message:
          "Khalti secret key is missing. Add KHALTI_SECRET_KEY in backend .env and restart the server.",
      });
    }

    const { bookingId, amount } = req.body;
    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "bookingId and amount are required",
      });
    }

    const booking = await Booking.findById(bookingId).populate("partyPalace");
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (String(booking.user) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own booking",
      });
    }

    const amountInPaisa = Math.round(Number(amount) * 100);
    const balanceDue =
      (Number(booking.totalPrice) || 0) - (Number(booking.advancePaid) || 0);

    if (!Number.isFinite(amountInPaisa) || amountInPaisa <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid payment amount",
      });
    }

    if (amountInPaisa > Math.round(balanceDue * 100)) {
      return res.status(400).json({
        success: false,
        message: "Payment amount cannot exceed the balance due",
      });
    }

    const frontendUrl = getFrontendUrl(req).replace(/\/$/, "");
    const purchaseOrderName =
      booking.partyPalace?.name || "Party Palace Booking";

    const khaltiResponse = await axios.post(
      `${getKhaltiBaseUrl()}/epayment/initiate/`,
      {
        return_url: `${frontendUrl}/bookings?paymentProvider=khalti&bookingId=${bookingId}&paymentAmount=${amountInPaisa}`,
        website_url: frontendUrl,
        amount: amountInPaisa,
        purchase_order_id: bookingId,
        purchase_order_name: purchaseOrderName,
      },
      {
        headers: {
          Authorization: `Key ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Khalti payment initiated",
      data: khaltiResponse.data,
    });
  } catch (err) {
    console.log(err.response?.data || err.message);

    return res.status(400).json({
      success: false,
      message:
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Unable to initiate Khalti payment",
      error: err.response?.data,
    });
  }
};

export const lookupKhaltiPaymentController = async (req, res) => {
  try {
    const secretKey = getKhaltiSecretKey();
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message:
          "Khalti secret key is missing. Add KHALTI_SECRET_KEY in backend .env and restart the server.",
      });
    }

    const { pidx, bookingId, amount } = req.body;
    if (!pidx || !bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "pidx, bookingId, and amount are required",
      });
    }

    const khaltiResponse = await axios.post(
      `${getKhaltiBaseUrl()}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const payload = khaltiResponse.data;
    if (payload.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: `Khalti payment status is ${payload.status}`,
        data: payload,
      });
    }

    const booking = await updateBookingPayment({
      bookingId,
      amount,
      pidx,
      payload,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: payload,
      booking,
    });
  } catch (err) {
    console.log(err.response?.data || err.message);

    return res.status(400).json({
      success: false,
      message:
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Payment verification failed",
      error: err.response?.data,
    });
  }
};
