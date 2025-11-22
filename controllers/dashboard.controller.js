import Booking from "../models/booking.model.js";
import PartyPalace from "../models/partypalace.model.js";

// Helper: get month name from index
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getDashboardData = async (req, res) => {
  try {
    // Total palaces
    const totalPalaces = await PartyPalace.countDocuments();

    // Active palaces: you could define as palaces that have bookings
    const activePalacesData = await Booking.distinct("partyPalace");
    const activePalaces = activePalacesData.length;

    // Total revenue (sum of totalPrice for fully paid bookings)
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Bookings this month
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Booking date is stored as string "YYYY-MM-DD"
    const monthlyBookings = await Booking.countDocuments({
      bookingDate: {
        $regex: `^${currentYear}-${currentMonth.toString().padStart(2, "0")}`,
      },
    });

    // Revenue trend by month
    const revenueTrendRaw = await Booking.aggregate([
      {
        $match: { paymentStatus: "paid" },
      },
      {
        $group: {
          _id: { $substr: ["$bookingDate", 5, 2] }, // MM
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const revenueTrend = revenueTrendRaw.map((item) => ({
      month: monthNames[parseInt(item._id) - 1],
      revenue: item.revenue,
    }));

    // Booking status counts
    const bookingStatusRaw = await Booking.aggregate([
      {
        $group: { _id: "$status", count: { $sum: 1 } },
      },
    ]);

    const bookingStatusData = bookingStatusRaw.map((item) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
    }));

    // Palace performance
    const palacePerformanceRaw = await Booking.aggregate([
      {
        $group: {
          _id: "$partyPalace",
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      {
        $lookup: {
          from: "partypalaces",
          localField: "_id",
          foreignField: "_id",
          as: "palace",
        },
      },
      { $unwind: "$palace" },
      {
        $project: {
          name: "$palace.name",
          bookings: 1,
          revenue: 1,
        },
      },
    ]);

    // Response
    return res.json({
      stats: {
        totalPalaces,
        activePalaces,
        totalRevenue,
        monthlyBookings,
      },
      revenueData: revenueTrend,
      bookingStatusData,
      palacePerformance: palacePerformanceRaw,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};
